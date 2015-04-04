#include "SimpleOscillator.h"

SimpleOscillator::SimpleOscillator() : multiplier(1.0f), dPhase(1. / 44100.) {
	// make frequency (Hz) table
	int i;
	double k = 1.059463094359;	// 12th root of 2
	double a = 6.875;	// a
	a *= k;	// b
	a *= k;	// bb
	a *= k;	// c, frequency of midi note 0
	for (i = 0; i < 128; i++)	// 128 midi notes
	{
		MIDI_TABLE[i] = (float)a;
		a *= k;
	}
}

SimpleOscillator::~SimpleOscillator() {

}

void SimpleOscillator::playNote(int note, int delta) {
	if (note >= 0 && note < 128) {
		notes.push_back(note);
		phases.push_back(0.0f);
	}
}

void SimpleOscillator::stopNote(int note) {
	// stops all notes since that's all we need for this purpose
	stopNotes();
}

void SimpleOscillator::stopNotes() {
	notes.clear();
	phases.clear();
}

void SimpleOscillator::generateOutputEm(uintptr_t output, int sampleFrames) {
	float* outputptr = reinterpret_cast<float*>(output);
	generateOutput(outputptr, sampleFrames);
}

// This method directly mirrors the ScriptProcessorNode onaudioprocess
void SimpleOscillator::generateOutput(float* output, int sampleFrames) {
	std::vector<int>::size_type i, I;
	float dphi;
	int n;

	//I = this.notes.length;
	I = notes.size();
	for (n = 0; n < sampleFrames; n++) {
		*output = 0.0f;
		for (i = 0; i < I; i++) {
			//dphi = this.notes[i] / this.context.sampleRate;
			dphi = MIDI_TABLE[notes.at(i)] * dPhase;
			//output[n] += Math.sin(this.phases[i] * 2 * Math.PI);
			*output += (float)std::sin(phases.at(i) * 2 * PI) * multiplier;
			//this.phases[i] += dphi;
			phases.at(i) += dphi;
			//if (this.phases[i] > 1) this.phases[i] -= 1;
			if (phases.at(i) > 1.0f) 
				phases.at(i) -= (float)1.0f;
		}
		output++;
	}
}