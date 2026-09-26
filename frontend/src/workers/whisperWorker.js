import { pipeline, env } from '@xenova/transformers';

// Disable local models since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;

self.onmessage = async (event) => {
    const { audioData, language } = event.data;
    
    try {
        if (!transcriber) {
            self.postMessage({ status: 'loading', message: 'Downloading Whisper AI model (approx 40MB). This only happens once...' });
            
            // Load the Whisper Tiny model (multilingual)
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
                progress_callback: (progress) => {
                    self.postMessage({ status: 'progress', progress });
                }
            });
        }
        
        self.postMessage({ status: 'processing', message: 'Transcribing local audio...' });
        
        // Run transcription
        // Transformers.js expects audio as Float32Array at 16000Hz
        const result = await transcriber(audioData, {
            language: language || 'hindi',
            task: 'transcribe',
        });
        
        self.postMessage({ status: 'success', text: result.text });
        
    } catch (error) {
        console.error("Whisper Error:", error);
        self.postMessage({ status: 'error', error: error.message });
    }
};
