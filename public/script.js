let voiceActive = false;
let recognition;
let synth = window.speechSynthesis;

function toggleContainer(event) {
  const container = document.getElementById('agentforce-container');
  container.classList.toggle('collapsed');
  container.classList.toggle('expanded');
  event.stopPropagation();
}

function handleContainerClick(event) {
  const container = document.getElementById('agentforce-container');
  if (container.classList.contains('collapsed')) {
    container.classList.remove('collapsed');
    container.classList.add('expanded');
  }
}

function toggleVoice() {
  voiceActive = !voiceActive;
  const talkBtn = document.getElementById('talkButton');
  talkBtn.classList.toggle('active', voiceActive);
  if (voiceActive) startVoice();
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('messageInput').value = transcript;
    sendMessage();
  };

  recognition.onend = () => {
    if (voiceActive) recognition.start();
  };

  recognition.start();
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('/images/user.png', message);
  input.value = '';
  document.getElementById('loadingIndicator').classList.remove('hidden');

  fetch('/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      const response = data.response || '[No response]';
      appendMessage('/images/agent.png', response);
      if (voiceActive) speak(response);
    })
    .catch(err => {
      console.error('Send error:', err);
      appendMessage(null, `❌ Error: ${err.message}`);
    })
    .finally(() => {
      document.getElementById('loadingIndicator').classList.add('hidden');
    });
}

function appendMessage(iconUrl, text) {
  const convo = document.getElementById('conversation');
  const div = document.createElement('div');
  div.className = 'message';

  if (iconUrl) {
    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = '';
    div.appendChild(img);
  }

  const span = document.createElement('span');
  span.textContent = text;
  div.appendChild(span);

  convo.appendChild(div);
  convo.scrollTop = convo.scrollHeight;
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}
// Fetch and display the initial greeting on load
window.addEventListener('DOMContentLoaded', () => {
  fetch('/greeting')
    .then(res => res.json())
    .then(data => {
      if (data.greeting) {
        appendMessage('/images/agent.png', data.greeting);
        if (voiceActive) speak(data.greeting);
      }
    })
    .catch(err => {
      console.error('Failed to fetch greeting:', err);
    });
});
