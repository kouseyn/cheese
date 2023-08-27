const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const scoreDiv = document.getElementById('score');
let isGameRunning = false;

startBtn.addEventListener('click', startGame);

async function startGame() {
  if (isGameRunning) {
    return;
  }
  
  isGameRunning = true;
  startBtn.disabled = true;
  statusDiv.textContent = 'Listen for the prompt and shout loudly!';

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const mediaStreamSource = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  mediaStreamSource.connect(analyser);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let volumeSum = 0;
  const duration = 3000; // 3 seconds

  const updateVolume = () => {
    const startTime = Date.now();
    let currentTime = Date.now();

    const processAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      dataArray.forEach(value => sum += value);
      const volume = sum / bufferLength;
      volumeSum += volume;
      
      currentTime = Date.now();
      if (currentTime - startTime < duration) {
        requestAnimationFrame(processAudio);
      } else {
        isGameRunning = false;
        startBtn.disabled = false;
        statusDiv.textContent = 'Game over!';
        const averageVolume = volumeSum / (duration / 1000); // Calculate average volume
        const score = Math.round(averageVolume);
        scoreDiv.textContent = `Score: ${score}`;
        audioContext.close();
      }
    };

    processAudio();
  };

  updateVolume();
}
