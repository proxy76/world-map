export const speakText = (text) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1; 
        utterance.pitch = 1; 
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Text-to-Speech is not supported in this browser.');
    }
};