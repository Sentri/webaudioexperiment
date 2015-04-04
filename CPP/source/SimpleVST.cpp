#include "SimpleVST.h"

AudioEffect* createEffectInstance(audioMasterCallback audioMaster) {
	return new SimpleVST(audioMaster);
}

SimpleVST::SimpleVST(audioMasterCallback audioMaster)
	: AudioEffectX(audioMaster, 0, NUM_PARAMS), multiplier(0.0f), intMulti(1) {
	osc = SimpleOscillator();
	if (audioMaster) {
		setNumInputs(0);
		setNumOutputs(1);
		canProcessReplacing();
		isSynth();
		setUniqueID('SplV');
	}
}

SimpleVST::~SimpleVST() {
}

void SimpleVST::processReplacing(float **inputs, float **outputs, VstInt32 sampleFrames) {
	float* output = outputs[0];
	osc.generateOutput(output, sampleFrames);
}

VstInt32 SimpleVST::processEvents(VstEvents* ev) {
	for (VstInt32 i = 0; i < ev->numEvents; i++)
	{
		if ((ev->events[i])->type != kVstMidiType)
			continue;

		VstMidiEvent* event = (VstMidiEvent*)ev->events[i];
		char* midiData = event->midiData;
		VstInt32 status = midiData[0] & 0xf0;	// ignoring channel
		if (status == 0x90 || status == 0x80)	// we only look at notes
		{
			VstInt32 note = midiData[1] & 0x7f;
			VstInt32 velocity = midiData[2] & 0x7f;
			if (status == 0x80)
				velocity = 0;	// note off by velocity 0
			if (!velocity)
				osc.stopNote(note);
			else {
				for (int i = 0; i < intMulti; i++) {
					osc.playNote(note, event->deltaFrames);
				}
			}
		}
		else if (status == 0xb0)
		{
			if (midiData[1] == 0x7e || midiData[1] == 0x7b)	// all notes off
				osc.stopNotes();
		}
		event++;
	}
	return 1;
}

/*
Some parameter methods
*/

void SimpleVST::setSampleRate(float sampleRate) {
	AudioEffectX::setSampleRate(sampleRate);
	osc.setDPhase((float)(1. / sampleRate));
}

void SimpleVST::setBlockSize(VstInt32 blockSize) {
	AudioEffectX::setBlockSize(blockSize);
}

bool SimpleVST::getEffectName(char* name) {
	vst_strncpy(name, "SimpleVST", kVstMaxEffectNameLen);
	return true;
}

bool SimpleVST::getVendorString(char* text) {
	vst_strncpy(text, "Teemu Vartiainen", kVstMaxVendorStrLen);
	return true;
}

bool SimpleVST::getProductString(char* text) {
	vst_strncpy(text, "Simple VST Synth", kVstMaxProductStrLen);
	return true;
}

VstInt32 SimpleVST::getVendorVersion() {
	return 1000;
}

VstInt32 SimpleVST::canDo(char* text) {
	if (!strcmp(text, "receiveVstEvents"))
		return 1;
	if (!strcmp(text, "receiveVstMidiEvent"))
		return 1;
	return -1;	// explicitly can't do; 0 => don't know
}

VstInt32 SimpleVST::getNumMidiInputChannels() {
	return 1;
}

VstInt32 SimpleVST::getNumMidiOutputChannels() {
	return 0;
}

void SimpleVST::getParameterLabel(VstInt32 index, char* label) {
	vst_strncpy(label, "x", kVstMaxParamStrLen);
}

void SimpleVST::getParameterDisplay(VstInt32 index, char* text) {
	text[0] = 0;
	int2string(intMulti, text, kVstMaxParamStrLen);
}

void SimpleVST::getParameterName(VstInt32 index, char* label) {
	vst_strncpy(label, "Multi", kVstMaxParamStrLen);
}

void SimpleVST::setParameter(VstInt32 index, float value) {
	multiplier = value;
	intMulti = 1 + (int)(99.0f * multiplier);
	osc.setMultiplier((float)1.0f / (float)intMulti);
}

float SimpleVST::getParameter(VstInt32 index) {
	return multiplier;
}

bool SimpleVST::getParameterProperties(VstInt32 index, VstParameterProperties* p) {
	p->stepFloat = 1.0f;
	p->smallStepFloat = 1.0f;
	p->largeStepFloat = 10.0f;

	vst_strncpy(p->label, "Multiplier", kVstMaxLabelLen);
	vst_strncpy(p->shortLabel, "Multi", kVstMaxShortLabelLen);

	p->flags = kVstParameterUsesFloatStep;

	return true;
}