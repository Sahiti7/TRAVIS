import React, { useEffect, useState } from 'react';

const AgentDashboard = () => {
  const [logMessages, setLogMessages] = useState([]);
  const [readyForCustomResponse, setReadyForCustomResponse] = useState(false);
  const socketRef = React.useRef(null);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const beep = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play();
  };

  const addMessage = (text, sender) => {
    setLogMessages(prev => [...prev, { text, sender }]);
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/agent?client_type=agent");
    socketRef.current = socket;

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "user_message") {
        const query = message.text;
        addMessage("Customer: " + query, "user");

        const res = await fetch('http://localhost:8000/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query })
        });

        const data = await res.json();
        const aiResponse = data.response;
        addMessage("AI: " + aiResponse, "agent");
        speak("AI suggests: " + aiResponse);
      }

      if (message.type === "customer_unsatisfied") {
        // ✅ This triggers when customer clicks "No"
        addMessage("⚠️ Customer is NOT satisfied. Please respond.", "alert");
        speak("Customer is not satisfied. Press V and speak your custom response.");
        beep();
        setReadyForCustomResponse(true);
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      addMessage("Agent (custom): " + speech, "agent");

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "agent_message",
          text: speech
        }));
        speak("Your response has been sent to the customer.");
        setReadyForCustomResponse(false);
      } else {
        alert("WebSocket not connected.");
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      speak("Sorry, I could not understand. Please try again.");
    };

    recognition.start();
  };

  // ✅ Key listener for V
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'v' && readyForCustomResponse) {
        speak("Recording. Start speaking after the beep.");
        beep();
        setTimeout(() => startSpeechRecognition(), 1000); // give time after beep
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readyForCustomResponse]);

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI' }}>
      <h2>Agent Dashboard</h2>

      <div style={{
        height: '300px',
        overflowY: 'scroll',
        border: '1px solid #ccc',
        padding: '10px',
        background: '#f9f9f9',
        marginBottom: '20px'
      }}>
        {logMessages.map((msg, index) => (
          <div key={index} style={{
            background:
              msg.sender === 'alert' ? '#ffe0e0' :
              msg.sender === 'user' ? '#d0f0ff' :
              msg.sender === 'agent' ? '#e0e0e0' :
              '#f1f1f1',
            border:
              msg.sender === 'alert' ? '2px solid red' : 'none',
            color:
              msg.sender === 'alert' ? '#990000' : '#000',
            fontWeight:
              msg.sender === 'alert' ? 'bold' : 'normal',
            padding: '8px',
            margin: '8px 0',
            borderRadius: '8px'
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      <p><strong>Instructions:</strong></p>
      <ul>
        <li>Wait for the customer query and AI response.</li>
        <li>If the customer is not satisfied, you'll hear an alert.</li>
        <li>Press <strong>V</strong> to record your custom response.</li>
        <li>Your response will be sent directly to the customer.</li>
      </ul>
    </div>
  );
};

export default AgentDashboard;
