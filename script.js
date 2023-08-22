/* Summary

  Handles Client-side

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

// Inside your client-side code
socket.on("add initial user list", (initialUserList) => {
  // Update the contact list with the initial user list
  updateContactList(initialUserList);
});

// Fetch initial user list when the app starts
socket.emit("get initial users");

sendButton.addEventListener("click", () => {
  const message = input.value;
  if (message.trim() !== "") {
    socket.emit("chat message", { message, sender: username });
    input.value = "";
  }
});

socket.on("chat message", (messageData) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", messageData.sender === username ? "sender" : "receiver");

  const messageParagraph = document.createElement("p");
  messageParagraph.textContent = `${messageData.message.message}`;
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