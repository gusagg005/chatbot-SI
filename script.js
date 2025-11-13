const chat = document.getElementById('chat');
const input = document.getElementById('userInput');

// 🔹 Función para convertir Markdown simple a HTML
function markdownToHTML(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **negritas**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *cursivas*
    .replace(/\n/g, '<br>') // saltos de línea
    .replace(/(\d+)\.\s/g, '<br><strong>$1.</strong> ') // listas numeradas
    .replace(/•/g, '• '); // viñetas
}

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  // 🔹 si el mensaje es del bot, interpretamos el formato
  if (sender === 'bot') {
    msg.innerHTML = markdownToHTML(text);
  } else {
    msg.textContent = text;
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// 🔹 ahora es async porque esperará la respuesta del servidor
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';

  // mensaje temporal mientras responde el modelo
  addMessage("Pensando... 🤔", 'bot');
  const reply = await botReply(text);
  chat.removeChild(chat.lastChild); // elimina el "Pensando..."
  addMessage(reply, 'bot');
}

// 🔹 esta función envía el mensaje al servidor en Render
async function botReply(text) {
  try {
    const res = await fetch("https://mi-chat-bot.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error(err);
    return "😢 Error al conectar con el servidor Render. Revisa la URL o la conexión.";
  }
}

// 🔹 presionar Enter
input.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});
