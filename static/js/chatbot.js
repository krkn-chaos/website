class KrknChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        // Use relative URL for production deployment, falls back to localhost for development
        this.apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3001/api/chat' 
            : '/.netlify/functions/chat';
        // Session storage key for persisting conversation across page navigations
        this.sessionKey = 'krkn-chat-session';
        // Maximum messages to persist (keep last 20 to avoid storage bloat)
        this.maxPersistedMessages = 20;
        this.createChatbot();
    }

    // ---------------------------------------------------------------------------
    // Page context: detect which doc section the user is currently reading
    // so the chatbot can surface more relevant answers without any backend change.
    // ---------------------------------------------------------------------------
    detectPageContext() {
        const path = window.location.pathname;

        // Map URL path segments to human-readable doc section labels
        const contextMap = [
            { pattern: /\/docs\/scenarios\/pod-scenario/,          label: 'Pod Scenarios' },
            { pattern: /\/docs\/scenarios\/container-scenario/,    label: 'Container Scenarios' },
            { pattern: /\/docs\/scenarios\/node-scenarios/,        label: 'Node Scenarios' },
            { pattern: /\/docs\/scenarios\/network-chaos/,         label: 'Network Chaos' },
            { pattern: /\/docs\/scenarios\/pod-network-scenario/,  label: 'Pod Network Chaos' },
            { pattern: /\/docs\/scenarios\/application-outage/,    label: 'Application Outage' },
            { pattern: /\/docs\/scenarios\/service-disruption/,    label: 'Service Disruption' },
            { pattern: /\/docs\/scenarios\/service-hijacking/,     label: 'Service Hijacking' },
            { pattern: /\/docs\/scenarios\/zone-outage/,           label: 'Zone Outage Scenarios' },
            { pattern: /\/docs\/scenarios\/power-outage/,          label: 'Power Outage Scenarios' },
            { pattern: /\/docs\/scenarios\/hog-scenarios\/cpu/,    label: 'CPU Hog Scenario' },
            { pattern: /\/docs\/scenarios\/hog-scenarios\/memory/, label: 'Memory Hog Scenario' },
            { pattern: /\/docs\/scenarios\/hog-scenarios\/io/,     label: 'IO Hog Scenario' },
            { pattern: /\/docs\/scenarios\/pvc-scenario/,          label: 'PVC Disk Fill Scenario' },
            { pattern: /\/docs\/scenarios\/time-scenarios/,        label: 'Time Skew Scenarios' },
            { pattern: /\/docs\/scenarios\/dns-outage/,            label: 'DNS Outage Scenario' },
            { pattern: /\/docs\/scenarios\/etcd-split-brain/,      label: 'ETCD Split Brain' },
            { pattern: /\/docs\/scenarios\/aurora-disruption/,     label: 'Aurora Disruption' },
            { pattern: /\/docs\/scenarios\/efs-disruption/,        label: 'EFS Disruption' },
            { pattern: /\/docs\/scenarios\/syn-flood/,             label: 'Syn Flood Scenario' },
            { pattern: /\/docs\/scenarios\/http-load/,             label: 'HTTP Load Scenario' },
            { pattern: /\/docs\/scenarios\/kubevirt/,              label: 'KubeVirt VM Outage' },
            { pattern: /\/docs\/scenarios\/network-chaos-ng/,      label: 'Network Chaos NG' },
            { pattern: /\/docs\/scenarios/,                        label: 'Chaos Scenarios' },
            { pattern: /\/docs\/krkn_ai/,                          label: 'Krkn AI' },
            { pattern: /\/docs\/krkn-operator/,                    label: 'Krkn Operator' },
            { pattern: /\/docs\/cerberus/,                         label: 'Cerberus' },
            { pattern: /\/docs\/krknctl/,                          label: 'krknctl CLI' },
            { pattern: /\/docs\/installation/,                     label: 'Installation' },
            { pattern: /\/docs\/getting-started/,                  label: 'Getting Started' },
            { pattern: /\/docs\/krkn/,                             label: 'Krkn Core' },
        ];

        for (const entry of contextMap) {
            if (entry.pattern.test(path)) {
                return entry.label;
            }
        }

        // No specific doc section detected — return null so no pill is shown
        return null;
    }

    // ---------------------------------------------------------------------------
    // Session persistence: save/restore conversation from sessionStorage so
    // messages survive page navigation within the same browser tab.
    // ---------------------------------------------------------------------------
    saveSession() {
        try {
            const toSave = this.messages.slice(-this.maxPersistedMessages).map(msg => ({
                text: msg.text,
                sender: msg.sender,
                timestamp: msg.timestamp
            }));
            sessionStorage.setItem(this.sessionKey, JSON.stringify(toSave));
        } catch (e) {
            // sessionStorage may be unavailable (private browsing restrictions) — fail silently
        }
    }

    loadSession() {
        try {
            const raw = sessionStorage.getItem(this.sessionKey);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    clearSession() {
        try {
            sessionStorage.removeItem(this.sessionKey);
        } catch (e) {
            // fail silently
        }
        this.messages = [];
        const messagesContainer = document.getElementById('krkn-chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        this.addMessage("Hi! I'm your Krkn assistant. I can help you with questions about chaos engineering, installation, scenarios, and more. What would you like to know?", 'bot');
        this.updatePageContextPill();
        this.updateQuickButtons();
    }

    // ---------------------------------------------------------------------------
    // Page-specific quick question suggestions.
    // Returns 3 questions relevant to the current doc section, or the default
    // set when the user is not on a specific doc page.
    // ---------------------------------------------------------------------------
    getPageSuggestions() {
        const path = window.location.pathname;

        const suggestionMap = [
            {
                pattern: /\/docs\/scenarios\/pod-scenario/,
                suggestions: [
                    { emoji: '⏱️', label: 'Recovery time metrics', question: 'How does Krkn measure pod recovery time?' },
                    { emoji: '🏷️', label: 'Exclude label', question: 'How do I use exclude_label to protect pods?' },
                    { emoji: '🖥️', label: 'Target specific nodes', question: 'How do I target pods on specific nodes?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/node-scenarios/,
                suggestions: [
                    { emoji: '☁️', label: 'Cloud providers', question: 'Which cloud providers does node scenario support?' },
                    { emoji: '🔄', label: 'Node recovery', question: 'How does Krkn recover a node after chaos?' },
                    { emoji: '⚙️', label: 'Node config', question: 'What are the required config fields for node scenarios?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/network-chaos/,
                suggestions: [
                    { emoji: '📡', label: 'Packet loss', question: 'How do I inject packet loss with network chaos?' },
                    { emoji: '⏳', label: 'Add latency', question: 'How do I add network latency to a pod?' },
                    { emoji: '📊', label: 'Bandwidth limit', question: 'How do I restrict bandwidth in network chaos?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/pod-network-scenario/,
                suggestions: [
                    { emoji: '📡', label: 'Pod packet loss', question: 'How do I inject packet loss at the pod level?' },
                    { emoji: '🏷️', label: 'Exclude label', question: 'How do I use exclude_label in pod network chaos?' },
                    { emoji: '⏳', label: 'Pod latency', question: 'How do I add latency to a specific pod?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/application-outage/,
                suggestions: [
                    { emoji: '🚫', label: 'Block traffic', question: 'How do I block ingress traffic with application outage?' },
                    { emoji: '🔌', label: 'Egress block', question: 'How do I block egress traffic for an application?' },
                    { emoji: '⏱️', label: 'Outage duration', question: 'How do I set the duration of an application outage?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/hog-scenarios\/cpu/,
                suggestions: [
                    { emoji: '📈', label: 'CPU load', question: 'How do I set the CPU load percentage for hog scenario?' },
                    { emoji: '🎯', label: 'Target node', question: 'How do I target a specific node for CPU hog?' },
                    { emoji: '⏱️', label: 'Hog duration', question: 'How do I configure the duration of CPU hog?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/hog-scenarios\/memory/,
                suggestions: [
                    { emoji: '💾', label: 'Memory amount', question: 'How do I set the memory amount for memory hog?' },
                    { emoji: '🎯', label: 'Target node', question: 'How do I target a specific node for memory hog?' },
                    { emoji: '⏱️', label: 'Hog duration', question: 'How do I configure the duration of memory hog?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/zone-outage/,
                suggestions: [
                    { emoji: '🌍', label: 'Zone config', question: 'How do I configure a zone outage scenario?' },
                    { emoji: '☁️', label: 'Cloud support', question: 'Which clouds support zone outage scenarios?' },
                    { emoji: '🔄', label: 'Zone recovery', question: 'How does the cluster recover from a zone outage?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios\/cerberus|\/docs\/cerberus/,
                suggestions: [
                    { emoji: '🛡️', label: 'Health signal', question: 'How does Cerberus provide a go/no-go signal?' },
                    { emoji: '⚙️', label: 'Setup Cerberus', question: 'How do I set up and configure Cerberus?' },
                    { emoji: '🔔', label: 'Slack alerts', question: 'How do I configure Cerberus Slack notifications?' }
                ]
            },
            {
                pattern: /\/docs\/krkn_ai/,
                suggestions: [
                    { emoji: '🤖', label: 'How it works', question: 'How does Krkn AI discover chaos scenarios?' },
                    { emoji: '📊', label: 'Fitness function', question: 'What is a fitness function in Krkn AI?' },
                    { emoji: '🚀', label: 'Run Krkn AI', question: 'How do I run Krkn AI against my cluster?' }
                ]
            },
            {
                pattern: /\/docs\/krknctl/,
                suggestions: [
                    { emoji: '📋', label: 'List scenarios', question: 'How do I list available scenarios with krknctl?' },
                    { emoji: '▶️', label: 'Run scenario', question: 'How do I run a scenario using krknctl?' },
                    { emoji: '⚙️', label: 'Install krknctl', question: 'How do I install krknctl?' }
                ]
            },
            {
                pattern: /\/docs\/installation/,
                suggestions: [
                    { emoji: '📦', label: 'Install krknctl', question: 'How do I install krknctl?' },
                    { emoji: '🐳', label: 'Krkn-hub', question: 'How do I run scenarios using krkn-hub containers?' },
                    { emoji: '🐍', label: 'Python install', question: 'How do I install Krkn as a Python package?' }
                ]
            },
            {
                pattern: /\/docs\/getting-started/,
                suggestions: [
                    { emoji: '▶️', label: 'First scenario', question: 'How do I run my first chaos scenario?' },
                    { emoji: '🔑', label: 'Kubeconfig', question: 'How do I point Krkn to my kubeconfig?' },
                    { emoji: '📊', label: 'Read results', question: 'How do I read the results after a chaos run?' }
                ]
            },
            {
                pattern: /\/docs\/scenarios/,
                suggestions: [
                    { emoji: '🌐', label: 'Network chaos', question: 'What network chaos scenarios are available?' },
                    { emoji: '📦', label: 'Pod scenarios', question: 'How do pod disruption scenarios work?' },
                    { emoji: '🖥️', label: 'Node failures', question: 'What node failure scenarios does Krkn support?' }
                ]
            }
        ];

        for (const entry of suggestionMap) {
            if (entry.pattern.test(path)) {
                return entry.suggestions;
            }
        }

        // Default suggestions for non-doc pages (homepage, blog, community)
        return [
            { emoji: '🚀', label: 'Getting Started', question: 'How do I get started with Krkn?' },
            { emoji: '⚡', label: 'Available Scenarios', question: 'What chaos scenarios are available?' },
            { emoji: '📦', label: 'Installation', question: 'How do I install Krkn?' }
        ];
    }

    // Replace quick buttons with page-specific suggestions
    updateQuickButtons() {
        const container = document.querySelector('.krkn-quick-questions');
        if (!container) return;

        const suggestions = this.getPageSuggestions();

        container.innerHTML = suggestions.map(s =>
            `<button class="krkn-quick-btn" data-question="${s.question.replace(/"/g, '&quot;')}">
                ${s.emoji} ${s.label}
            </button>`
        ).join('');

        // Re-attach click listeners to the new buttons
        container.querySelectorAll('.krkn-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.currentTarget.getAttribute('data-question');
                this.sendMessage(question);
            });
        });
    }

    // Show or hide the page context pill based on current URL
    updatePageContextPill() {
        const bar = document.getElementById('krkn-page-context-bar');
        const nameEl = document.getElementById('krkn-page-context-name');
        const pageContext = this.detectPageContext();

        if (bar && nameEl) {
            if (pageContext) {
                nameEl.textContent = pageContext;
                bar.hidden = false;
            } else {
                bar.hidden = true;
            }
        }
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
                    <div id="krkn-page-context-bar" class="krkn-page-context-bar" hidden>
                        <span class="krkn-page-context-label">Asking about:</span>
                        <span id="krkn-page-context-name" class="krkn-page-context-name"></span>
                        <button id="krkn-chat-clear" class="krkn-chat-clear" title="Clear conversation">
                            Clear
                        </button>
                    </div>

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

        // Clear conversation button
        const chatClear = document.getElementById('krkn-chat-clear');
        if (chatClear) {
            chatClear.addEventListener('click', () => this.clearSession());
        }

        // Quick question buttons
        document.querySelectorAll('.krkn-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                this.sendMessage(question);
            });
        });

        this.setupBasicDragging();

        // Restore previous session messages (if any) before showing welcome message
        const savedMessages = this.loadSession();
        if (savedMessages.length > 0) {
            savedMessages.forEach(msg => {
                this.addMessage(msg.text, msg.sender, /* skipSave */ true);
            });
        } else {
            // Add welcome message only when there is no prior session
            this.addMessage("Hi! I'm your Krkn assistant. I can help you with questions about chaos engineering, installation, scenarios, and more. What would you like to know?", 'bot', /* skipSave */ true);
        }

        // Show page context pill if user is on a specific doc page
        this.updatePageContextPill();

        // Replace quick buttons with page-specific suggestions
        this.updateQuickButtons();
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

            // Include the current doc page as context so the backend can
            // prioritise results from the section the user is already reading
            const pageContext = this.detectPageContext();

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: pageContext ? `krkn-documentation: ${pageContext}` : 'krkn-documentation',
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

    addMessage(text, sender, skipSave = false) {
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

        // Persist to sessionStorage unless this is a restore call
        if (!skipSave) {
            this.saveSession();
        }
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