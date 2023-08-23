export default class ChatManager {
    constructor() {
        this.messages = [];
    }

    addMessage(username, content) {
        if (!username || username.trim() === '') {
            username = 'Unnamed Cell';
        }

        this.messages.push({
            username,
            content
        });

        this.updateChatDisplay();
    }

    clearMessages() {
        this.messages = [];
        this.updateChatDisplay();
    }

    getMessages() {
        return this.messages;
    }

    updateChatDisplay() {
        const chatContainer = $("#chat-messages");
        chatContainer.empty();

        this.messages.forEach(message => {
            const messageElement = $(
                `<div class="message">
                    <span class="username">${message.username}:</span>
                    <span class="content">${message.content}</span>
                </div>`
            );
            chatContainer.append(messageElement);
        });

        // Scroll to the bottom
        chatContainer.scrollTop(chatContainer[0].scrollHeight);
    }
}