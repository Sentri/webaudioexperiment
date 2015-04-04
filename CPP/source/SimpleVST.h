#include "windows.h"
#include "audioeffectx.h"
#include "SimpleOscillator.h"

#define NUM_PARAMS 1

class SimpleVST : public AudioEffectX {
private:
	SimpleOscillator osc;
	float multiplier;
	int intMulti;
public:
	SimpleVST(audioMasterCallback audioMaster);
	~SimpleVST();

	void processReplacing(float **inputs, float **outputs, VstInt32 sampleFrames);
	VstInt32 processEvents(VstEvents* ev);

	void setSampleRate(float sampleRate);
	void setBlockSize(VstInt32 blockSize);
	
	bool getEffectName(char* name);
	bool getVendorString(char* text);
	bool getProductString(char* text);
	VstInt32 getVendorVersion();
	VstInt32 canDo(char* text);

	VstInt32 getNumMidiInputChannels();
	VstInt32 getNumMidiOutputChannels();

	void setParameter(VstInt32 index, float value);
	float getParameter(VstInt32 index);
	void getParameterLabel(VstInt32 index, char* label);
	void getParameterDisplay(VstInt32 index, char* text);
	void getParameterName(VstInt32 index, char* text);
	bool getParameterProperties(VstInt32 index, VstParameterProperties* p);

};