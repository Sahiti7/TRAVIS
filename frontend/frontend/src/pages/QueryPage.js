import React, { useState, useEffect, useRef } from 'react';
import './QueryPage.css';

const QueryPage = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [responseConfirmed, setResponseConfirmed] = useState(false);
  const ws = useRef(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws/agent?client_type=user');

    ws.current.onopen = () => {
      console.log('✅ WebSocket connected (customer)');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'model_response' || data.type === 'agent_message') {
        setMessages((prev) => [...prev, { sender: 'agent', text: data.text }]);

        const utter = new SpeechSynthesisUtterance(data.text);
        speechSynthesis.speak(utter);

        setShowFeedback(true);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const handleSend = async () => {
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setQuery('');
    setShowFeedback(false);
    setResponseConfirmed(false);

    try {
      await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
    } catch (error) {
      console.error('❌ Error sending query:', error);
      setMessages((prev) => [...prev, { sender: 'system', text: '⚠ Backend error. Try again later.' }]);
    }
  };

  const handleSatisfied = () => {
    setShowFeedback(false);
    setResponseConfirmed(true);
    setMessages((prev) => [...prev, { sender: 'system', text: '✅ You are satisfied with the response.' }]);
  };

  const handleNotSatisfied = () => {
    setShowFeedback(false);
    setMessages((prev) => [...prev, { sender: 'system', text: '❌ Not satisfied. Requesting agent...' }]);

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'customer_unsatisfied',
        text: 'Customer is not satisfied with the model response.'
      }));
    }
  };

  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="query-container">
      <div className="query-box">
        <h2>Ask Your Bank Query</h2>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, idx) => (
            <p key={idx} className={`chat-message ${msg.sender}`}>
              <strong>{msg.sender === 'user' ? 'You' : msg.sender === 'agent' ? 'Agent' : 'System'}:</strong> {msg.text}
            </p>
          ))}
        </div>

        <div className="query-input-group">
          <input
            type="text"
            placeholder="Type your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>

        <button className="send-button" onClick={handleSend}>Send</button>

        {showFeedback && !responseConfirmed && (
          <div className="feedback-section">
            <p className="feedback-question">Is it helpful?</p>
            <div className="feedback-buttons">
              <button className="feedback-btn yes-btn" onClick={handleSatisfied}>Yes ✅</button>
              <button className="feedback-btn no-btn" onClick={handleNotSatisfied}>No ❌</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;
