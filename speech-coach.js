/**
 * AI Speech Coach using Web Speech API (speechSynthesis)
 * Hands-free auditory drill caller and vocal feedback for archers & boxers.
 */
class SpeechCoach {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.voices = [];
    this.selectedVoice = null;

    if (this.synth) {
      this.initVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prefer clean English voices
    this.selectedVoice = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) || this.voices[0];
  }

  toggleVoice(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled && this.synth) {
      this.synth.cancel();
    }
    return this.enabled;
  }

  speak(text, priority = false, rate = 1.05, pitch = 1.0) {
    if (!this.enabled || !this.synth) return;

    if (priority) {
      this.synth.cancel(); // Interrupt previous message for immediate audio commands
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
  }

  speakCombo(comboStr) {
    // Convert "1 - 2 - Slip Right - 2" into natural audio callout
    const cleanStr = comboStr.replace(/-/g, ', ');
    this.speak(cleanStr, true, 1.25, 1.0);
  }
}

window.speechCoach = new SpeechCoach();
