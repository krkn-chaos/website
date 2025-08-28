class KrknChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        // Use relative URL for production deployment, falls back to localhost for development
        this.apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3001/api/chat' 
            : '/.netlify/functions/chat';
        this.createChatbot();
    }

    createChatbot() {
        const chatbotHTML = `
            <div id="krkn-chat-button" class="krkn-chat-button" title="Chat with Krkn Assistant - Ask about chaos engineering, scenarios, and installation">
                <img src="/img/2024_krkn_logo__Krkn_Full.svg" alt="Krkn Logo" class="krkn-chat-button-logo">
                <span class="krkn-chat-text">Ask about Krkn</span>
            </div>
            <div id="krkn-chat-window" class="krkn-chat-window">
                <div id="krkn-chat-header" class="krkn-chat-header">
                    <div class="krkn-chat-title">
                        <div class="krkn-chat-title-content">
                            <img src="/img/2024_krkn_logo__Krkn_Full.svg" alt="Krkn Logo" class="krkn-chat-logo">
                            <div class="krkn-chat-title-text">
                                <h3>Krkn Assistant</h3>
                                <p>Ask me anything about chaos engineering with Krkn!</p>
                            </div>
                        </div>
                    </div>
                    <button id="krkn-chat-close" class="krkn-chat-close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <div id="krkn-chat-messages" class="krkn-chat-messages"></div>
                
                <div class="krkn-chat-input-container">
                    <div class="krkn-quick-questions">
                        <button class="krkn-quick-btn" data-question="How do I get started with Krkn?">
                            🚀 Getting Started
                        </button>
                        <button class="krkn-quick-btn" data-question="What chaos scenarios are available?">
                            ⚡ Available Scenarios
                        </button>
                        <button class="krkn-quick-btn" data-question="How do I install Krkn?">
                            📦 Installation
                        </button>
                    </div>
                    
                    <div class="krkn-chat-input-wrapper">
                        <input 
                            type="text" 
                            id="krkn-chat-input" 
                            placeholder="Ask about Krkn documentation..." 
                            autocomplete="off"
                        >
                        <button id="krkn-chat-send" class="krkn-chat-send">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M18 2L9 11L4 6L2 8L9 15L20 4L18 2Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);

        // Add event listeners
        const chatButton = document.getElementById('krkn-chat-button');
        const chatWindow = document.getElementById('krkn-chat-window');
        const chatClose = document.getElementById('krkn-chat-close');
        const chatSend = document.getElementById('krkn-chat-send');
        const chatInput = document.getElementById('krkn-chat-input');

        chatButton.addEventListener('click', () => this.toggleChat());
        chatClose.addEventListener('click', () => this.toggleChat());
        chatSend.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick question buttons
        document.querySelectorAll('.krkn-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                this.sendMessage(question);
            });
        });

        this.setupBasicDragging();
        
        // Add welcome message
        this.addMessage("Hi! I'm your Krkn assistant. I can help you with questions about chaos engineering, installation, scenarios, and more. What would you like to know?", 'bot');
    }

    setupBasicDragging() {
        const chatWindow = document.getElementById('krkn-chat-window');
        const chatHeader = document.getElementById('krkn-chat-header');
        
        if (!chatWindow || !chatHeader) return;

        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let windowStart = { x: 0, y: 0 };

        chatHeader.addEventListener('mousedown', (e) => {
            if (e.target.closest('.krkn-chat-close')) return;
            
            isDragging = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            
            const rect = chatWindow.getBoundingClientRect();
            windowStart.x = rect.left;
            windowStart.y = rect.top;
            
            chatWindow.style.transition = 'none';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            let newX = windowStart.x + deltaX;
            let newY = windowStart.y + deltaY;
            
            const windowRect = chatWindow.getBoundingClientRect();
            const maxX = window.innerWidth - windowRect.width;
            const maxY = window.innerHeight - windowRect.height;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            chatWindow.style.left = newX + 'px';
            chatWindow.style.top = newY + 'px';
            chatWindow.style.right = 'auto';
            chatWindow.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                
                chatWindow.style.transition = '';
                document.body.style.userSelect = '';
            }
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('krkn-chat-window');
        const chatButton = document.getElementById('krkn-chat-button');
        
        if (this.isOpen) {
            chatWindow.classList.remove('active');
            chatButton.classList.remove('active');
            this.isOpen = false;
        } else {
            chatWindow.classList.add('active');
            chatButton.classList.add('active');
            this.isOpen = true;
            
            setTimeout(() => {
                document.getElementById('krkn-chat-input').focus();
            }, 300);
        }
    }

    async sendMessage(messageText = null) {
        const input = document.getElementById('krkn-chat-input');
        const message = messageText || input.value.trim();
        
        if (!message) return;

        input.value = '';
        this.addMessage(message, 'user');
        this.showTypingIndicator();

        try {
            // Get recent conversation context (last 3 messages)
            const recentMessages = this.messages.slice(-6).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: 'krkn-documentation',
                    conversationHistory: recentMessages
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.hideTypingIndicator();
            this.addMessage(data.response || "I'm sorry, I couldn't process your request right now. Please try again.", 'bot');
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("I'm having trouble connecting right now. Please check the documentation directly or try again later.", 'bot');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('krkn-chat-messages');
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const messageHTML = `
            <div class="krkn-message krkn-message-${sender}" id="${messageId}">
                <div class="krkn-message-content">
                    ${this.formatMessage(text)}
                </div>
                <div class="krkn-message-time">
                    ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({
            id: messageId,
            text: text,
            sender: sender,
            timestamp: new Date()
        });
    }

    formatMessage(text) {
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        formatted = formatted.split('\n').map(line => line.trim()).filter(line => line).map(line => `<p>${line}</p>`).join('');
        
        return formatted || '<p>No response available</p>';
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('krkn-chat-messages');
        const typingHTML = `
            <div class="krkn-message krkn-message-bot krkn-typing-indicator" id="typing-indicator">
                <div class="krkn-message-content">
                    <div class="krkn-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.krknChatbot = new KrknChatbot();
});