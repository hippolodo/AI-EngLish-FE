export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startPromise = null;
    this.stopPromise = null;
    this.resolveStop = null;
    this.generation = 0;
  }

  start() {
    if (this.startPromise) return this.startPromise;
    if (this.isRecording) return Promise.resolve();
    const generation = this.generation;
    const pending = this.startRecording(generation).finally(() => {
      if (this.startPromise === pending) this.startPromise = null;
    });
    this.startPromise = pending;
    return pending;
  }

  async startRecording(generation) {
    this.audioChunks = [];
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new Error('Trình duyệt của bạn không hỗ trợ thu âm qua MediaDevices.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      }
    });
    if (generation !== this.generation) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('Ghi âm đã được hủy.');
    }
    this.stream = stream;

    try {
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        ''
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (!mime || MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  stop() {
    if (this.stopPromise) return this.stopPromise;
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.cleanup();
      return Promise.resolve(null);
    }
    this.stopPromise = new Promise((resolve, reject) => {
      this.resolveStop = resolve;
      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          this.resolveStop = null;
          this.cleanup();
          resolve(audioBlob);
        } catch (err) {
          this.resolveStop = null;
          this.cleanup();
          reject(err);
        }
      };

      this.mediaRecorder.onerror = (err) => {
        this.resolveStop = null;
        this.cleanup();
        reject(err);
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.resolveStop = null;
        this.cleanup();
        reject(err);
      }
      this.isRecording = false;
    });
    return this.stopPromise;
  }

  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.pause();
      } catch (e) {
        console.warn('MediaRecorder pause error:', e);
      }
    }
  }

  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      try {
        this.mediaRecorder.resume();
      } catch (e) {
        console.warn('MediaRecorder resume error:', e);
      }
    }
  }

  isPaused() {
    return this.mediaRecorder && this.mediaRecorder.state === 'paused';
  }

  cleanup() {
    this.generation += 1;
    this.startPromise = null;
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.onerror = null;
      if (this.mediaRecorder.state !== 'inactive') {
        try { this.mediaRecorder.stop(); } catch { /* Tracks are stopped below. */ }
      }
    }
    this.resolveStop?.(null);
    this.resolveStop = null;
    this.stopPromise = null;
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }
}
