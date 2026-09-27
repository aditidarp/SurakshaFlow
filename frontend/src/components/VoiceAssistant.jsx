import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api/axios';
import './VoiceAssistant.css';

const WAKE_WORDS = ['help', 'bachao', 'madat', 'sos', 'emergency'];
const EMERGENCY_COMMAND_PATTERNS = ['help me', 'fire', 'flood', 'bachao', 'sos', 'emergency'];

const VoiceAssistant = ({ mode = 'floating' }) => {
  const [isListening, setIsListening] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Standby'); // Standby, Listening, Processing, Success, Error
  const [location, setLocation] = useState(null);
  const [logs, setLogs] = useState([]);

  // Refs for speech recognition objects to persist across renders
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const processVoiceCommandRef = useRef(null);

  // Flask voice API (optional). If unavailable, we fall back to Node API.
  const FLASK_API_URL = process.env.REACT_APP_VOICE_API_URL || 'http://localhost:5001/api/voice-command';

  useEffect(() => {
    // 1. Fetch Location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          addLog("📍 Location acquired successfully.");
        },
        (error) => {
          console.warn('Geolocation blocked. Defaulting to unknown.');
          addLog("⚠️ Location access denied by user.");
          setLocation({ lat: 19.0760, lng: 72.8777 }); // Default Mumbai
        }
      );
    }

    // 2. Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Error: Browser Doesn't Support Voice API");
      addLog("❌ Web Speech API not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Works for Hinglish/Marathi accent recognition

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      const text = currentTranscript.trim().toLowerCase();
      setTranscript(text);
      lastTranscriptRef.current = text;
      
      // Clear previous timeout since user is still talking
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      if (handsFreeRef.current) {
        // HANDS-FREE: Immediately check for emergency words while listening
        const emergencyDetected = detectEmergencyIntent(text) || WAKE_WORDS.some(word => text.includes(word));
        if (emergencyDetected) {
           addLog("🎯 Emergency command detected in continuous mode.");
           recognition.stop();
           processVoiceCommandRef.current?.(text);
        }
      } else {
        // MANUAL MODE: Wait for 2 seconds of silence, then auto-submit
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
          processVoiceCommandRef.current?.(text);
        }, 2000);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setStatus(`Error: ${event.error}`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart if hands-free is enabled and we didn't just submit
      if (handsFreeRef.current && statusRef.current !== 'Processing' && statusRef.current !== 'Success') {
         recognition.start();
      } else if (statusRef.current === 'Listening...') {
         setStatus("Standby");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Use refs to bypass closures in onend callback
  const handsFreeRef = useRef(handsFree);
  const statusRef = useRef(status);
  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  const detectEmergencyIntent = (text) => {
    const normalizedText = (text || '').toLowerCase().trim();
    if (!normalizedText) return false;
    return EMERGENCY_COMMAND_PATTERNS.some((command) => normalizedText.includes(command));
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setStatus("Standby");
      setIsListening(false);
    } else {
      setTranscript('');
      setStatus('Listening...');
      recognitionRef.current.start();
    }
  };

  const toggleHandsFree = () => {
    setHandsFree(!handsFree);
    addLog(`Hands-Free Mode ${!handsFree ? 'Enabled 🟢' : 'Disabled 🔴'}`);
    if (!handsFree && !isListening) {
      // Starting hands-free should force recognition to start
      recognitionRef.current.start();
    } else if (handsFree) {
      recognitionRef.current.stop(); // Stops the auto-loop
      setStatus('Standby');
    }
  };

  const processVoiceCommand = async (commandText) => {
    if (!commandText.trim()) return;

    if (!detectEmergencyIntent(commandText)) {
      setStatus("No emergency command");
      addLog("ℹ️ Command ignored. Try: help me, fire, or flood.");
      if (handsFreeRef.current && recognitionRef.current) {
        recognitionRef.current.start();
      }
      return;
    }

    setStatus("Processing");
    setIsListening(false);
    addLog(`Transcribed: "${commandText}"`);
    
    // Fallback coords
    const payloadLoc = location || { lat: 0, lng: 0 };

    try {
      const response = await axios.post(FLASK_API_URL, {
        command: commandText,
        location: payloadLoc
      });

      if (response.data.success) {
        setStatus("Alert Dispatched!");
        addLog(`🚨 SUCCESS: ${response.data.detected_type} alert broadcasted.`);
        speakText("Your alert has been sent. Help is on the way.");
        
        // Reset to standby after 4s
        setTimeout(() => {
          setStatus("Standby");
          setTranscript('');
          if (handsFreeRef.current) recognitionRef.current.start();
        }, 4000);
      }
    } catch (error) {
       console.error(error);
       setStatus("Voice service unavailable");
       addLog("❌ Voice API unavailable. Switching to direct SOS fallback...");
       // Implement basic retry logic (simulated for UI)
       setTimeout(() => emergencyFallback(), 3000);
    }
  };
  processVoiceCommandRef.current = processVoiceCommand;

  // Immediate unconditional SOS (does not rely on NLP)
  const emergencyFallback = async () => {
     addLog("📡 Triggering unconditional SOS Fallback");
     setStatus("Processing");
     
     try {
       await api.post('/alerts/simple/create', {
         title: "Manual SOS Activation",
         description: "User triggered emergency fallback button.",
         severity: "Critical",
         location: `Lat: ${location?.lat || 0}, Lng: ${location?.lng || 0}`
       });
       setStatus("SOS Triggered!");
       speakText("Emergency SOS activated. Stay calm.");
       setTimeout(() => setStatus("Standby"), 4000);
     } catch (err) {
       setStatus("Network Failure");
       addLog("❌ Direct SOS failed. Check backend connectivity.");
       speakText("Network failure. Please dial 1 1 2 manually.");
     }
  };

  return (
    <div className={`voice-assistant-card ${isListening ? 'active' : ''} ${mode === 'embedded' ? 'embedded' : ''}`}>
      <div className="va-header">
        <h3>🎙️ Intelligent Voice SOS</h3>
        <button 
          className={`hands-free-btn ${handsFree ? 'on' : 'off'}`}
          onClick={toggleHandsFree}
          title="Continuously listens for emergency commands like help me, fire, flood"
        >
          {handsFree ? 'Hands-Free: ON 🟢' : 'Hands-Free: OFF 🔴'}
        </button>
      </div>

      <div className="va-main">
        <button 
          className={`mic-btn ${isListening ? 'pulsing' : ''}`}
          onClick={toggleListen}
        >
          {isListening ? '🛑' : '🎤'}
        </button>
        <p className={`status-text ${status.toLowerCase()}`}>{status}</p>
        
        <div className="transcript-box">
          {transcript || "Speak emergency commands: 'help me', 'fire', 'flood'..."}
        </div>
      </div>

      <div className="va-footer">
        <div className="loc-badge">
          📍 {location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : 'Locating...'}
        </div>
        <button className="sos-fallback-btn" onClick={emergencyFallback}>
          🚨 SEND SOS NOW
        </button>
      </div>

      <div className="va-logs">
        <code>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </code>
      </div>
    </div>
  );
};

export default VoiceAssistant;
