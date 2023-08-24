/** 
 * Summary
 * Handles Client-side 
*/

const socket = io();

const input = document.getElementById("input");
const sendButton = document.getElementById("send-button");
const messageContainer = document.querySelector(".message-container");

const username = prompt("Please enter your username:");
if (username) {
  socket.emit("user joined", username);
}

socket.on("user connected", (userList) => {
  // Update the contact list with the updated user list
  updateContactList(userList);
});

socket.on("add initial user list", (initialUserList) => {
  // Update the contact list with the initial user list
  updateContactList(initialUserList);
});

// Fetch initial user list when the app starts
socket.emit("get initial users");

const emojiMap = {
  ":)": "😄",
  ":(": "😞",
  "hey": "👋",
  "lol": "🤣",
  "ok": "👌",
  "woah": "😮",
  "like": "♥️"
};

/**
 * Replace words in message with emoji 
 * @param {string} message - Input message
 * @returns {string} Message with emoji replacements
*/
function replaceWordsWithEmojis(message) {
  if(!message || typeof message !== 'string') {
    throw new Error('Message must be a string');
  }  

  const wordsToReplace = Object.keys(emojiMap);

  function getEmoji(word) {
    if (wordsToReplace.includes(word)) {
      return emojiMap[word];  
    }
    return word;
  }

  const words = message.split(/\s+/); // Split the message into words

  const updatedWords = words.map(word => {
      if (word.startsWith(":") && word.endsWith(":")) {
          const emojiKey = word.slice(1, -1).toLowerCase();
          return getEmoji(emojiKey);
      }
      return word;
  });
  
  return updatedWords.join(" ");

  // const wordsToReplace = Object.keys(emojiMap).map(escapeRegExp);
  // const pattern = new RegExp(wordsToReplace.join("|"), "gi");

  // return message.replace(pattern, (matched) => emojiMap[matched.toLowerCase()] || matched);
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
}

function handleSlashCommand(command) {
  const parts = command.split(' ');
  const slashCommand = parts[0].toLowerCase();

  switch (slashCommand) {
    case '/help':
      // Show help modal
      const helpModal = document.getElementById('helpModal');
      const helpClose = document.getElementById('helpClose');
      helpModal.style.display = 'block';

      helpClose.onclick = function () {
        helpModal.style.display = 'none';
      };

      window.onclick = function (event) {
        if (event.target == helpModal) {
          helpModal.style.display = 'none';
        }
      }
      break;
    case '/clear':
      // Clear messages
      socket.emit('clear my messages');
      break;
    case '/random':
      socket.emit('generate random number');
      break;
    case '/emoji':
      // Show emoji guide modal
      const emojiModal = document.getElementById('emojiModal');
      const emojiClose = document.getElementById('emojiClose');
      emojiModal.style.display = 'block';

      emojiClose.onclick = function () {
        emojiModal.style.display = 'none';
      };

      window.onclick = function (event) {
        if (event.target == emojiModal) {
          emojiModal.style.display = 'none';
        }
      }
      break;
    default:
      // Unknown slash command
      break;
  }
}

socket.on('clear my messages', () => {
  messageContainer.innerHTML = ''; // Clear messages on user's screen
});

socket.on('show random number', (randomNum) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'sender');

  const messageParagraph = document.createElement("p");
  messageParagraph.textContent = `Here's your random number: ${randomNum}`;
  messageDiv.appendChild(messageParagraph);

  //messageDiv.textContent = `Here's your random number: ${randomNum}`;

  messageContainer.appendChild(messageDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});
  
function sendMessage() {
  const message = input.value.trim();

  if (message !== "") {
    // Check for slash commands
    if (message.startsWith('/')) {
      handleSlashCommand(message);
    } else {
      // Regular message
      const updatedMessage = replaceWordsWithEmojis(message); // Replace words with emojis
      socket.emit("chat message", { message: updatedMessage, sender: username });
    }
    input.value = "";
  }
}

sendButton.addEventListener("click", sendMessage);

// Add event listener to input for "Enter" key press
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default behavior of the "Enter" key (line break)
    sendMessage();
  }
});

socket.on("chat message", (messageData) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", messageData.sender === username ? "sender" : "receiver");

  const messageParagraph = document.createElement("p");
  messageParagraph.textContent = replaceWordsWithEmojis(messageData.message.message);
  messageDiv.appendChild(messageParagraph);

  messageContainer.appendChild(messageDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

const contactList = document.querySelector(".contact-list");

function updateContactList(userList) {
  contactList.innerHTML = '';

  userList.forEach((user) => {
    const contactItem = document.createElement("div");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
      <img src="${user.avatar}" alt="User Avatar" class="avatar">
      <div class="contact-info">
        <p class="contact-name">${user.username}</p>
        <p class="last-message">${user.lastMessage}</p>
      </div>
    `;
    contactList.appendChild(contactItem);
  });
}