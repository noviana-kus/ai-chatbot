const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to conversation and display it
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  // Show a thinking indicator
  const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    if (result.success) {
      const botMessage = result.data;
      // Update the "thinking" message with the actual response
      thinkingMessage.textContent = botMessage;
      conversation.push({ role: 'model', text: botMessage });
    } else {
      thinkingMessage.textContent = 'Sorry, something went wrong. ' + (result.message || '');
    }
  } catch (error) {
    console.error('Error:', error);
    thinkingMessage.textContent = 'Sorry, I couldn\'t connect to the server.';
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element
}
