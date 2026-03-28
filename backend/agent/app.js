const socket = new WebSocket('ws://localhost:8000/ws/agent?client_type=agent');

let lastModelResponse = '';
let lastSpokenText = '';

socket.onopen = () => {
  console.log("✅ Agent WebSocket connected.");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📦 WebSocket received:", data);

  if (data.type === 'query') {
    document.getElementById('customer-query').textContent = data.query;
    document.getElementById('model-response').textContent = data.model_response;

    speakText("Customer asked: " + data.query);
    setTimeout(() => {
      speakText("Model suggests: " + data.model_response);
    }, 1500);

    lastModelResponse = data.model_response;

  } else if (data.type === 'customer_unsatisfied') {
    document.getElementById('alert-box').style.display = 'block';
    document.getElementById('alert-box').textContent =
      "⚠️ Customer is NOT satisfied. Press V to speak a reply.";
    speakText("Customer is not satisfied. Press V to speak a reply.");
  }
};

// ✅ Click on Send button = Send model response
document.getElementById('send-btn').addEventListener('click', () => {
  sendModelResponse();
});

// ✅ Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // ALT + TAB = Send model response
  if (e.code === 'Tab' && e.altKey) {
    e.preventDefault();
    sendModelResponse();
  }

  // SPACEBAR = Send model response
  if (e.code === 'Space') {
    e.preventDefault();
    sendModelResponse();
  }

  // V = Agent speaks a custom voice message
  if (e.key === 'v' || e.key === 'V') {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    speakText("🎤 Listening...");

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript.trim();
      lastSpokenText = transcript;

      document.getElementById('agent-reply').textContent = transcript;

      socket.send(JSON.stringify({
        type: 'agent_message',
        text: transcript
      }));

      speakText("✅ Your message has been sent to the customer.");
    };

    recognition.onerror = function (err) {
      console.error("Speech recognition error:", err.error);
      speakText("⚠️ Voice input failed. Please try again.");
    };

    recognition.onend = function () {
      console.log("🎤 Voice input ended.");
    };
  }
});

// ✅ Function to send model response
function sendModelResponse() {
  if (lastModelResponse) {
    socket.send(JSON.stringify({
      type: 'agent_approve',
      text: lastModelResponse
    }));
    speakText("Model response sent to customer.");
  } else {
    alert("❗ No model response available to send.");
  }
}

// ✅ Text-to-speech helper
function speakText(text) {
  const utter = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utter);
}
