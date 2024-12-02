const audioCache = {};

const createBeep = (frequency = 440, duration = 200, volume = 0.1) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.value = volume;
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, duration);
};

export const playNotificationSound = async (type = 'default') => {
  const frequencies = {
    default: 440,
    achievement: 880,
    message: 660,
    warning: 220
  };

  try {
    if (!audioCache[type]) {
      // If sound file doesn't exist, create a beep
      createBeep(frequencies[type] || frequencies.default);
      return;
    }
    await audioCache[type].play();
  } catch (error) {
    console.error('Error playing notification sound:', error);
    // Fallback to beep if sound file fails
    createBeep(frequencies[type] || frequencies.default);
  }
}; 