function AudioTest(ai) {
    this.audiointerface = ai;
    this.playing = false;
    this.noteCountElement = false;
    this.noteMultiplierElement = false;
    this.noteCount = 1;
    this.noteMultiplier = 1;
}

// returns: 0, 1, -1, 2, -2, 3, -3, ... when x = 0, 1, 2, 3, 4, 5, 6, ...
function discreteAlternate(x) {
    if (x == 0) return 0;
    if ((x+1) % 2 == 0) {
        return (x+1) / 2;
    } else {
        return -x / 2;
    }
}

AudioTest.prototype = {

    // bind mouse events for a given button for the latency test
    bindLatencyTest: function (buttonid) {
        var button = document.getElementById(buttonid);
        button.addEventListener('mousedown', this.startLatencyTest.bind(this));
        button.addEventListener('mouseup', this.stopLatencyTest.bind(this));
        button.addEventListener('mouseleave', this.stopLatencyTest.bind(this));
    },

    // mouse event listeners
    startLatencyTest: function (event) {
        if (!this.playing) {
            this.audiointerface.playNote(69);
            this.playing = true;
        }
    },
    stopLatencyTest: function (event) {
        if (this.playing) {
            this.audiointerface.stopNote(69);
            this.playing = false;
        }
    },

    // bind mouse events for a given button for the polyphony test
    bindPolyphonyTest: function (buttonid, notesid, multiid) {
        var button = document.getElementById(buttonid);
        this.noteCountElement = document.getElementById(notesid);
        this.noteMultiplierElement = document.getElementById(multiid);

        button.addEventListener('mousedown', this.startPolyphonyTest.bind(this));
        button.addEventListener('mouseup', this.stopPolyphonyTest.bind(this));
        button.addEventListener('mouseleave', this.stopPolyphonyTest.bind(this));

        this.noteCountElement.addEventListener('change', this.valueChange.bind(this));
        this.noteMultiplierElement.addEventListener('change', this.valueChange.bind(this));
    },

    // bind the event for the input field
    valueChange: function (event) {
        if (this.playing) return;
        this.noteCount = parseInt(this.noteCountElement.value, 10);
        this.noteMultiplier = parseInt(this.noteMultiplierElement.value, 10);
    },

    // mouse event listeners
    startPolyphonyTest: function (event) {
        if (!this.playing) {
            var scaler = 1 / this.noteMultiplier;
            this.audiointerface.setMultiplier(scaler);
            for (var i = 0; i < this.noteCount; i++) {
                for (var j = 0; j < this.noteMultiplier; j++) {
                    this.audiointerface.playNote(64 + discreteAlternate(i));
                }
            }
            this.playing = true;
        }
    },
    stopPolyphonyTest: function (event) {
        if (this.playing) {
            this.audiointerface.setMultiplier(1);
            for (var i = 0; i < this.noteCount; i++) {
                this.audiointerface.stopNote(64 + discreteAlternate(i));
            }
            this.playing = false;
        }
    },
};

