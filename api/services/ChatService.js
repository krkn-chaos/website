const axios = require('axios');
const logger = require('../utils/logger');

class ChatService {
    constructor(options = {}) {
        this.documentationIndex = options.documentationIndex;
        this.llmProvider = options.llmProvider || 'gemini';
        this.apiKey = options.apiKey;
        this.model = options.model || 'gemini-2.5-flash';
        this.maxTokens = options.maxTokens || 4000;
        this.temperature = options.temperature || 0.7;

        
        // Initialize the appropriate LLM service
        this.initializeLLMService();
        
        this.systemPrompt = `You are a helpful assistant for the Krkn chaos engineering documentation. 

Krkn is a Kubernetes chaos engineering tool that helps test the resilience of applications and infrastructure.

**IMPORTANT: Keep responses concise and direct. Aim for 2-4 sentences maximum unless the user specifically asks for detailed explanations.**

Your role is to:
- Help users understand how to use Krkn, Krkn-hub, and Krknctl
- Explain chaos engineering concepts in the context of Krkn
- Guide users through installation, configuration, and usage
- Provide information about available chaos scenarios
- Help troubleshoot common issues
- Direct users to relevant documentation sections

**Response Style:**
- Be brief and to the point
- Start with the most important information
- Use bullet points for lists when helpful
- Provide 1-2 relevant documentation links
- Only elaborate when explicitly asked for details

Key components of the Krkn ecosystem:
- **Krkn**: The core chaos engineering tool (CNCF sandbox project)
- **Krkn-hub**: Containerized wrapper for easy scenario execution
- **Krknctl**: Recommended command-line tool for orchestrating chaos scenarios
- **Krkn-lib**: Low-level Kubernetes functions library
- **Cerberus**: Monitoring and health-checking companion tool

Available chaos scenarios include:
- **Pod Scenarios**: Delete/disrupt pods, test application resilience
- **Node Scenarios**: Reboot, stop, terminate, or crash nodes
- **Container Scenarios**: Kill containers with specific signals
- **Network Chaos**: Inject latency, packet loss, bandwidth restrictions
- **Application Outages**: Isolate ingress/egress traffic
- **Resource Hog**: CPU, Memory, and IO stress scenarios
- **Zone Outages**: Multi-availability zone failure simulation
- **Service Disruption**: Disrupt Kubernetes services
- **Service Hijacking**: Hijack service endpoints
- **Time Scenarios**: Clock skew and time manipulation
- **PVC Scenarios**: Persistent volume claim disruptions
- **Power Outages**: Simulate power failures
- **KubeVirt VM Outage**: Virtual machine disruptions

Your role:
- Help users understand installation, configuration, and usage
- Explain chaos engineering concepts and available scenarios
- Provide specific step-by-step instructions when needed
- Direct users to relevant documentation with clickable links

IMPORTANT: When referencing documentation, always provide clickable links using this format:
- Getting Started: [Getting Started](/docs/getting-started/)
- Installation: [Installation](/docs/installation/)
- Krkn Documentation: [Krkn](/docs/krkn/)
- Krknctl Documentation: [Krknctl](/docs/krknctl/)
- Krkn-hub Documentation: [Krkn-hub](/docs/krkn-hub/)
- Cerberus Documentation: [Cerberus](/docs/cerberus/)
- All Scenarios: [Scenarios](/docs/scenarios/)
- Pod Scenarios: [Pod Scenarios](/docs/scenarios/pod-scenario/)
- Node Scenarios: [Node Scenarios](/docs/scenarios/node-scenarios/)
- Network Chaos: [Network Chaos](/docs/scenarios/network-chaos-scenario/)
- CPU Hog Scenarios: [CPU Hog](/docs/scenarios/hog-scenarios/cpu-hog-scenario/)
- Memory Hog Scenarios: [Memory Hog](/docs/scenarios/hog-scenarios/memory-hog-scenario/)
- IO Hog Scenarios: [IO Hog](/docs/scenarios/hog-scenarios/io-hog-scenario/)
- Application Outages: [Application Outages](/docs/scenarios/application-outage/)
- Service Disruption: [Service Disruption](/docs/scenarios/service-disruption-scenarios/)
- Time Scenarios: [Time Scenarios](/docs/scenarios/time-scenarios/)
- Zone Outages: [Zone Outages](/docs/scenarios/zone-outage-scenarios/)
- Container Scenarios: [Container Scenarios](/docs/scenarios/container-scenario/)
- PVC Scenarios: [PVC Scenarios](/docs/scenarios/pvc-scenario/)
- Power Outage: [Power Outage](/docs/scenarios/power-outage-scenarios/)
- Network Chaos NG: [Network Chaos NG](/docs/scenarios/network-chaos-ng-scenarios/)
- Pod Network Scenarios: [Pod Network](/docs/scenarios/pod-network-scenario/)
- Service Hijacking: [Service Hijacking](/docs/scenarios/service-hijacking-scenario/)
- Syn Flood: [Syn Flood](/docs/scenarios/syn-flood-scenario/)
- KubeVirt VM Outage: [KubeVirt VM Outage](/docs/scenarios/kubevirt-vm-outage-scenario/)
- Developer Guide: [Developer Guide](/docs/developers-guide/)
- Contribution Guidelines: [Contribution Guidelines](/docs/contribution-guidelines/)
CRITICAL: Always format links using markdown syntax: [Link Text](/path/to/page/) - NEVER use plain URLs like "/docs/something".


Examples of proper link formatting:
- [Getting Started](/docs/getting-started/)
- [Installation](/docs/installation/)
- [CPU Hog Scenario](/docs/scenarios/hog-scenarios/cpu-hog-scenario/)
- [Node Scenarios](/docs/scenarios/node-scenarios/)
- [All Scenarios](/docs/scenarios/)

Always be helpful, accurate, and concise. If you're not sure about something, direct users to the official documentation.
Now run the chatbot with proper link formatting.`;
    }

    initializeLLMService() {
        switch (this.llmProvider.toLowerCase()) {
            case 'openai':
                this.llmEndpoint = 'https://api.openai.com/v1/chat/completions';
                this.headers = {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                };
                break;
            case 'anthropic':
                this.llmEndpoint = 'https://api.anthropic.com/v1/messages';
                this.headers = {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                };
                break;
            case 'gemini':
                this.llmEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
                this.headers = {
                    'x-goog-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                };
                break;

            default:
                throw new Error(`Unsupported LLM provider: ${this.llmProvider}`);
        }
    }

    async processMessage(userMessage, options = {}) {
        const startTime = Date.now();
        
        try {
            const conversationHistory = options.conversationHistory || [];
            
            // For follow-up questions, use conversation context to enhance the query
            const enhancedQuery = this.enhanceQueryWithContext(userMessage, conversationHistory);
            
            // Search for relevant documentation
            const relevantDocs = await this.findRelevantDocumentation(enhancedQuery);
            
            // Build context-aware prompt with conversation history
            const prompt = this.buildPrompt(userMessage, relevantDocs, conversationHistory);
            
            // Get response from LLM
            const response = await this.callLLM(prompt);
            
            const processingTime = Date.now() - startTime;
            
            logger.info('Chat message processed', {
                processingTime,
                relevantDocsCount: relevantDocs.length,
                responseLength: response.length,
                hasConversationHistory: conversationHistory.length > 0
            });
            
            return response;
            
        } catch (error) {
            logger.error('Error processing chat message:', error);
            throw new Error('Failed to process your message. Please try again.');
        }
    }

    async findRelevantDocumentation(query) {
        if (!this.documentationIndex) {
            logger.warn('Documentation index not available');
            return [];
        }

        try {
            // Detect queries that might need more conservative limits
            const queryLower = query.toLowerCase();
            const isCountingQuery = queryLower.includes('total') || 
                                   queryLower.includes('number') || 
                                   queryLower.includes('count');
            
            const isEtcdQuery = queryLower.includes('etcd');
            const isTechnicalQuery = queryLower.includes('kubernetes') || 
                                    queryLower.includes('production') || 
                                    queryLower.includes('deployment') ||
                                    queryLower.includes('architecture') ||
                                    queryLower.includes('workflow') ||
                                    queryLower.includes('troubleshoot');
            
            // Use ultra-minimal limits for etcd queries to prevent MAX_TOKENS
            const searchLimit = isEtcdQuery ? 0 : 1;  // No context for etcd queries
            
            let searchResults = [];
            if (searchLimit > 0) {
                searchResults = await this.documentationIndex.search(query, {
                    limit: searchLimit,
                    threshold: 0.3
                });
            }
            
            // Use minimal content length for absolute safety
            const contentLength = 50;
            
            return searchResults.map(result => ({
                title: result.title,
                content: result.content.substring(0, contentLength),
                url: result.url,
                score: result.score,
                topic: result.topic
            }));
            
        } catch (error) {
            logger.error('Error searching documentation:', error);
            return [];
        }
    }

    enhanceQueryWithContext(userMessage, conversationHistory) {
        const queryLower = userMessage.toLowerCase();
        
        // Check if this is a follow-up question
        const isFollowUp = queryLower.includes('more info') || 
                          queryLower.includes('tell me more') || 
                          queryLower.includes('give me more') ||
                          queryLower.includes('what about') ||
                          queryLower.includes('details') ||
                          queryLower.includes('explain') ||
                          (queryLower.length < 20 && conversationHistory.length > 0);
        
        if (isFollowUp && conversationHistory.length > 0) {
            // Get the last user question and assistant response for context
            const recentContext = conversationHistory.slice(-4); // Last 2 exchanges
            const lastUserQuestion = recentContext.filter(msg => msg.role === 'user').pop();
            
            if (lastUserQuestion) {
                // Combine the previous context with the current question
                return `Previous context: "${lastUserQuestion.content}". Current question: "${userMessage}"`;
            }
        }
        
        return userMessage;
    }

    buildPrompt(userMessage, relevantDocs, conversationHistory = []) {
        // Use ultra-short prompts for etcd queries to prevent MAX_TOKENS
        const queryLower = userMessage.toLowerCase();
        
        // Check if this is an etcd-related query (including follow-ups)
        const isEtcdQuery = queryLower.includes('etcd') || 
                           (conversationHistory.length > 0 && 
                            conversationHistory.some(msg => msg.content && msg.content.toLowerCase().includes('etcd')));
        
        const isTechnicalQuery = queryLower.includes('kubernetes') || 
                               queryLower.includes('production') || 
                               queryLower.includes('deployment') ||
                               queryLower.includes('architecture') ||
                               queryLower.includes('workflow') ||
                               queryLower.includes('troubleshoot');
        
        let systemPrompt = this.systemPrompt;
        if (isEtcdQuery) {
            systemPrompt = `You are a Krkn chaos engineering assistant. To target etcd components on your cluster, here are the most effective approaches:

**Direct etcd Node Impact:**
- [Node Scenarios](/docs/scenarios/node-scenarios/) - Stop, reboot, or terminate nodes running etcd pods/containers
- [CPU Hog](/docs/scenarios/hog-scenarios/cpu-hog-scenario/) - Create CPU pressure on etcd nodes to test performance degradation
- [Memory Hog](/docs/scenarios/hog-scenarios/memory-hog-scenario/) - Exhaust memory on etcd nodes to simulate resource constraints

**etcd Pod/Container Targeting:**
- [Pod Scenarios](/docs/scenarios/pod-scenario/) - Delete etcd pods directly (if running as pods)
- [Container Scenarios](/docs/scenarios/container-scenario/) - Kill etcd containers with specific signals

**Network-Based etcd Disruption:**
- [Network Chaos](/docs/scenarios/network-chaos-scenario/) - Inject latency/packet loss between etcd nodes
- [Service Disruption](/docs/scenarios/service-disruption-scenarios/) - Disrupt etcd service endpoints

**Advanced etcd Testing:**
- [Zone Outages](/docs/scenarios/zone-outage-scenarios/) - Test etcd cluster resilience across availability zones

Use markdown links: [Text](/path). Be specific about targeting etcd.`;
        } else if (isTechnicalQuery) {
            systemPrompt = `You are a helpful assistant for Krkn chaos engineering documentation. Keep responses very brief and concise. 

CRITICAL: Always format links using markdown syntax: [Link Text](/path/to/page/) - NEVER use plain URLs.

Examples:
- [CPU Hog Scenario](/docs/scenarios/hog-scenarios/cpu-hog-scenario/)
- [Node Scenarios](/docs/scenarios/node-scenarios/)
- [Installation](/docs/installation/)`;
        }
        
        let context = '';
        if (relevantDocs.length > 0) {
            context = '\n\n=== CONTEXT ===\n';
            relevantDocs.forEach((doc, index) => {
                context += `${index + 1}. ${doc.title} (${doc.url})\n${doc.content}\n\n`;
            });
            context += 'IMPORTANT: Keep responses concise (2-3 sentences max). Include relevant links.\n\n';
        }

        // Add conversation history for follow-up questions
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            const queryLower = userMessage.toLowerCase();
            const isFollowUp = queryLower.includes('more info') || 
                              queryLower.includes('tell me more') || 
                              queryLower.includes('give me more') ||
                              queryLower.includes('what about') ||
                              queryLower.includes('details') ||
                              queryLower.includes('explain') ||
                              (queryLower.length < 20);
            
            if (isFollowUp) {
                conversationContext = '\n\n=== CONVERSATION HISTORY ===\n';
                conversationHistory.slice(-4).forEach(msg => {
                    conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n`;
                });
                conversationContext += '\nNOTE: The user is asking a follow-up question. Use the conversation history to provide more detailed information about the previously discussed topic.\n\n';
            }
        }

        return {
            system: systemPrompt + context + conversationContext,
            user: userMessage
        };
    }

    async callLLM(prompt) {
        // Use fallback response if API key is not properly configured
        if (!this.apiKey || this.apiKey.length < 10) {
            return this.getFallbackResponse(prompt.user);
        }

        try {
            let requestPayload;
            
            switch (this.llmProvider.toLowerCase()) {
                case 'openai':
                    requestPayload = {
                        model: this.model,
                        messages: [
                            { role: 'system', content: prompt.system },
                            { role: 'user', content: prompt.user }
                        ],
                        max_tokens: this.maxTokens,
                        temperature: this.temperature,
                        presence_penalty: 0.1,
                        frequency_penalty: 0.1
                    };
                    break;
                    
                case 'anthropic':
                    requestPayload = {
                        model: this.model,
                        max_tokens: this.maxTokens,
                        temperature: this.temperature,
                        system: prompt.system,
                        messages: [
                            { role: 'user', content: prompt.user }
                        ]
                    };
                    break;
                    
                case 'gemini':
                    requestPayload = {
                        contents: [
                            {
                                parts: [
                                    { text: `${prompt.system}\n\nUser: ${prompt.user}\n\nAssistant:` }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: this.temperature,
                            maxOutputTokens: this.maxTokens,
                            topP: 0.8,
                            topK: 10
                        }
                    };
                    break;
                    
                default:
                    throw new Error(`Unsupported LLM provider: ${this.llmProvider}`);
            }

            const response = await axios.post(this.llmEndpoint, requestPayload, {
                headers: this.headers,
                timeout: 30000 // 30 second timeout
            });

            return this.extractResponseText(response.data);
            
        } catch (error) {
            if (error.response) {
                logger.error('LLM API error:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });
                
                if (error.response.status === 401) {
                    throw new Error('Authentication failed with LLM service');
                } else if (error.response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (error.response.status >= 500) {
                    throw new Error('LLM service is temporarily unavailable');
                } else if (error.response.status === 400) {
                    throw new Error(`Bad request to LLM service: ${JSON.stringify(error.response.data)}`);
                }
            }
            
            logger.error('LLM request failed:', error);
            throw new Error('Failed to get response from AI service');
        }
    }

    getFallbackResponse(userMessage) {
        return `Hello! I'm the Krkn documentation assistant. I can help you with chaos engineering questions.

Please check our documentation:
- [Getting Started](/docs/getting-started/)  
- [Installation](/docs/installation/)
- [Available Scenarios](/docs/scenarios/)
- [Complete Documentation](/docs/)

*Note: Enhanced AI responses are currently unavailable. Please refer to the documentation links above for detailed information.*`;
    }

    extractResponseText(responseData) {
        switch (this.llmProvider.toLowerCase()) {
            case 'openai':
                if (responseData.choices && responseData.choices.length > 0) {
                    return responseData.choices[0].message.content.trim();
                }
                break;
                
            case 'anthropic':
                if (responseData.content && responseData.content.length > 0) {
                    return responseData.content[0].text.trim();
                }
                break;
                
            case 'gemini':
                if (responseData.candidates && responseData.candidates.length > 0) {
                    const candidate = responseData.candidates[0];
                    
                    // Handle MAX_TOKENS case gracefully
                    if (candidate.finishReason === 'MAX_TOKENS') {
                        return "I apologize, but my response was too long and got cut off. Please try asking a more specific question, or let me know if you'd like me to break down the information into smaller parts.";
                    }
                    
                    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                        return candidate.content.parts[0].text.trim();
                    }
                }
                break;
        }
        
        logger.error('Failed to extract response from LLM service', { 
            provider: this.llmProvider, 
            responseKeys: Object.keys(responseData) 
        });
        throw new Error('Unable to extract response from LLM service');
    }

    isConfigured() {
        return !!(this.apiKey && this.llmProvider && this.model);
    }

    getStatus() {
        return {
            provider: this.llmProvider,
            model: this.model,
            configured: this.isConfigured(),
            documentationIndexAvailable: !!this.documentationIndex
        };
    }
}

module.exports = ChatService;
