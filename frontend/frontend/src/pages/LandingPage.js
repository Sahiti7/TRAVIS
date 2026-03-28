import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [spaceCount, setSpaceCount] = useState(0);
  const navigate = useNavigate();

  const handleCustomerLogin = () => {
    navigate('/register');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        setSpaceCount((prev) => prev + 1);
      } else {
        setSpaceCount(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (spaceCount === 4) {
      playBeep();
      setTimeout(() => {
        window.open('http://127.0.0.1:5500/backend/agent/chat.html', '_blank');
        setSpaceCount(0);
      }, 300);
    }
  }, [spaceCount]);

  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  };

  return (
    <div>
      {/* ✅ Main Landing Section */}
      <div className="landing-container">
        <div className="landing-text">
          <h1>
            AI Helpdesk <br />
            for <span>Visually Impaired</span> <br />
            <span>Service Agents</span>
          </h1>
          <p>
            Empowering visually impaired agents to handle customer queries
            through intelligent voice-based solutions.
          </p>

          <div className="landing-buttons">
            <button className="get-started" onClick={handleCustomerLogin}>
              Get Started
            </button>
            <button className="login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button
              className="agent"
              onClick={() =>
                window.open('http://127.0.0.1:5500/backend/agent/chat.html', '_blank')
              }
            >
              Agent Login
            </button>
          </div>
        </div>

        <div className="landing-image">
          <img
            src="https://latinbusinesstoday.com/wp-content/uploads/2022/09/Banking-on-the-Future.jpeg"
            alt="Banking assistant"
          />
        </div>
      </div>

      {/* ✅ Feature Boxes */}
      <div className="features-section">
        <div className="feature-box">
          <h3>Accessibility First</h3>
          <p>Designed specifically for visually impaired banking staff.</p>
        </div>
        <div className="feature-box">
          <h3>Voice-Powered</h3>
          <p>AI-powered voice interface simplifies complex tasks.</p>
        </div>
        <div className="feature-box">
          <h3>Secure & Smart</h3>
          <p>Secure interactions with intelligent query handling.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
