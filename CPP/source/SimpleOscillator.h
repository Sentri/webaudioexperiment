#include <vector>
#include <cmath>

#ifdef EMSCRIPTEN
	#include <emscripten/bind.h>
	using namespace emscripten;
#endif

const double PI = std::acos(-1);

class SimpleOscillator {
private:
	std::vector<int> notes;
	std::vector<float> phases;
	float dPhase;
	float multiplier;
public:
	float MIDI_TABLE[128];

	SimpleOscillator();
	~SimpleOscillator();

	float getDPhase() const { return dPhase; };
	void setDPhase(float d) { dPhase = d; };

	float getMultiplier () const { return multiplier; };
	void setMultiplier(float m) { multiplier = m; };

	void playNote(int note, int delta);
	void stopNote(int note);
	void stopNotes();

	void generateOutputEm(uintptr_t output, int sampleFrames);
	void generateOutput(float* output, int sampleFrames);
};

#ifdef EMSCRIPTEN
	EMSCRIPTEN_BINDINGS(simpleoscillator_bind) {
		class_<SimpleOscillator>("SimpleOscillator")
			.constructor<>()
			.function("playNote", &SimpleOscillator::playNote)
			.function("stopNote", &SimpleOscillator::stopNote)
			.function("stopNotes", &SimpleOscillator::stopNotes)
			.function("generateOutputEm", &SimpleOscillator::generateOutputEm)
			.property("dPhase", &SimpleOscillator::getDPhase, &SimpleOscillator::setDPhase)
			.property("multiplier", &SimpleOscillator::getMultiplier, &SimpleOscillator::setMultiplier)
			;
	}
#endif