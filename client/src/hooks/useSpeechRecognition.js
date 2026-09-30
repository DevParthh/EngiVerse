// Filename: client/src/hooks/useSpeechRecognition.js

import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = () => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Web Speech API is not supported by this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setText(finalTranscript + interimTranscript);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setText('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { text, setText, isListening, startListening, stopListening, hasRecognitionSupport: !!recognitionRef.current };
};

export default useSpeechRecognition;