import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AgentLoginPage = () => {
  const navigate = useNavigate();
  const [spacePressCount, setSpacePressCount] = useState(0);
  const [loginReady, setLoginReady] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        setSpacePressCount(prev => prev + 1);

        if (spacePressCount + 1 === 4) {
          const speech = new SpeechSynthesisUtterance("Agent verification ready. Press Alt Tab to log in.");
          window.speechSynthesis.speak(speech);
          setLoginReady(true);
        }
      } else if (loginReady) {
        const speech = new SpeechSynthesisUtterance("Agent login successful. Redirecting to dashboard.");
        window.speechSynthesis.speak(speech);
        setTimeout(() => {
          navigate('/agent/dashboard');
        }, 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spacePressCount, loginReady, navigate]);

  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <h2>Agent Login (Keyboard Only)</h2>
      <p>Press the spacebar 4 times, then use Alt+Tab to log in.</p>
    </div>
  );
};

export default AgentLoginPage;
