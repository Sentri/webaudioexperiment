/// <reference path="SimpleOscillator.js" />

/*
 * General (do nothing) example of what the interface should look like
 */

function AudioInterface() { };
AudioInterface.prototype = {
    // Play a note by number (mimic MIDI Note On)
    playNote: function (noteNumber) { },
    // Stop a note by number (mimic MIDI Note Off)
    stopNote: function (noteNumber) { },
    // set a note multiplier
    setMultiplier: function (value) { },
};

/*
 * Uses native OscillatorNode.
 * Oscillators are created dynamically..
 */

function NativeInterface() {
    this.ctx = new AudioContext();
    this.notes = [];
    this.gains = [];
    this.scaler = 1;
};

NativeInterface.prototype = {
    playNote: function (note) {
        var oscillator = this.ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = MIDI_TABLE[note];
        var gain = this.ctx.createGain();
        gain.gain.value = this.scaler;
        oscillator.connect(gain);
        gain.connect(this.ctx.destination);
        oscillator.start();
        this.notes.push(oscillator);
        this.gains.push(gain);
    },
    stopNote: function (note) {
        for (key in this.notes) {
            this.notes[key].stop();
            this.notes[key].disconnect();
            this.gains[key].disconnect();
        }
        this.notes = [];
        this.gains = [];
    },
    setMultiplier: function (value) {
        this.scaler = value;
    },
};

/*
 * Produces the same with scriptprocessor
 */

function ScriptInterface() {
    this.ctx = new AudioContext();
    this.node = this.ctx.createScriptProcessor(512, 1, 1);
    this.node.notes = [];
    this.node.phases = [];
    this.node.multiplier = 1;

    this.node.onaudioprocess = function (event) {
        var input, output, N, n, i, I, dphi;
        output = event.outputBuffer.getChannelData(0);
        N = output.length;
        I = this.notes.length;
        for (n = 0; n < N; n++) {
            output[n] = 0;
            for (i = 0; i < I; i++) {
                dphi = this.notes[i] / this.context.sampleRate;
                output[n] += Math.sin(this.phases[i] * 2 * Math.PI) * this.multiplier;
                this.phases[i] += dphi;
                if (this.phases[i] > 1) this.phases[i] -= 1;
            }
        }
    };
    this.node.connect(this.ctx.destination);
};

ScriptInterface.prototype = {
    playNote: function (note) {
        this.node.notes.push(MIDI_TABLE[note]);
        this.node.phases.push(0);
    },
    stopNote: function (note) {
        this.node.notes = [];
        this.node.phases = [];
    },
    setMultiplier: function (value) {
        this.node.multiplier = value;
    },
};

/*
 * Emscripten 
 */
function EmscriptenInterface() {
    this.ctx = new AudioContext();
    this.node = this.ctx.createScriptProcessor(512, 1, 1);
    var osc = new Module.SimpleOscillator();
    osc.dPhase = (1 / this.ctx.sampleRate);
    this.node.oscillator = osc;

    this.node.onaudioprocess = function (event) {
        var output;
        output = event.outputBuffer.getChannelData(0);
        var l = output.length;

        // copy the output buffer into the Emscripten heap
        var nDataBytes = l * output.BYTES_PER_ELEMENT;
        var dataPtr = Module._malloc(nDataBytes);
        var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        dataHeap.set(new Uint8Array(output.buffer));

        // call the wrapper method with the pointer argument
        this.oscillator.generateOutputEm(dataHeap.byteOffset, l);

        // read the heap to make a float array again
        var result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, l);
        Module._free(dataHeap.byteOffset);

        // copy the array back onto the channel output
        for (var i = 0; i < l; i++) {
            output[i] = result[i];
        }
    };
    this.node.connect(this.ctx.destination);
};

EmscriptenInterface.prototype = {
    playNote: function (note) {
        this.node.oscillator.playNote(note, 0);
    },
    stopNote: function (note) {
        this.node.oscillator.stopNote(note);
    },
    setMultiplier: function (value) {
        this.node.oscillator.multiplier = value;
    },
};

/*
 * Array for MIDI -> Frequency conversion
 */

var MIDI_TABLE = [
    8.1757989156,
    8.6619572180,
    9.1770239974,
    10.3008611535,
    10.3008611535,
    10.9133822323,
    11.5623257097,
    12.2498573744,
    12.9782717994,
    13.7500000000,
    14.5676175474,
    15.4338531643,
    16.3515978313,
    17.3239144361,
    18.3540479948,
    19.4454364826,
    20.6017223071,
    21.8267644646,
    23.1246514195,
    24.4997147489,
    25.9565435987,
    27.5000000000,
    29.1352350949,
    30.8677063285,
    32.7031956626,
    34.6478288721,
    36.7080959897,
    38.8908729653,
    41.2034446141,
    43.6535289291,
    46.2493028390,
    48.9994294977,
    51.9130871975,
    55.0000000000,
    58.2704701898,
    61.7354126570,
    65.4063913251,
    69.2956577442,
    73.4161919794,
    77.7817459305,
    82.4068892282,
    87.3070578583,
    92.4986056779,
    97.9988589954,
    103.8261743950,
    110.0000000000,
    116.5409403795,
    123.4708253140,
    130.8127826503,
    138.5913154884,
    146.8323839587,
    155.5634918610,
    164.8137784564,
    174.6141157165,
    184.9972113558,
    195.9977179909,
    207.6523487900,
    220.0000000000,
    233.0818807590,
    246.9416506281,
    261.6255653006,
    277.1826309769,
    293.6647679174,
    311.1269837221,
    329.6275569129,
    349.2282314330,
    369.9944227116,
    391.9954359817,
    415.3046975799,
    440.0000000000,
    466.1637615181,
    493.8833012561,
    523.2511306012,
    554.3652619537,
    587.3295358348,
    622.2539674442,
    659.2551138257,
    698.4564628660,
    739.9888454233,
    783.9908719635,
    830.6093951599,
    880.0000000000,
    932.3275230362,
    987.7666025122,
    1046.5022612024,
    1108.7305239075,
    1174.6590716696,
    1244.5079348883,
    1318.5102276515,
    1396.9129257320,
    1479.9776908465,
    1567.9817439270,
    1661.2187903198,
    1760.0000000000,
    1864.6550460724,
    1975.5332050245,
    2093.0045224048,
    2217.4610478150,
    2349.3181433393,
    2489.0158697766,
    2637.0204553030,
    2793.8258514640,
    2959.9553816931,
    3135.9634878540,
    3322.4375806396,
    3520.0000000000,
    3729.3100921447,
    3951.0664100490,
    4186.0090448096,
    4434.9220956300,
    4698.6362866785,
    4978.0317395533,
    5274.0409106059,
    5587.6517029281,
    5919.9107633862,
    5919.9107633862,
    6644.8751612791,
    7040.0000000000,
    7458.6201842894,
    7902.1328200980,
    8372.0180896192,
    8869.8441912599,
    9397.2725733570,
    9956.0634791066,
    10548.0818212118,
    11175.3034058561,
    11839.8215267723,
    12543.8539514160
];