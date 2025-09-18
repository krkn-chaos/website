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

**Your expertise**: Help users with Krkn chaos engineering - installation, scenarios, troubleshooting, and best practices.

**Key principles**:
- Use the provided documentation context to answer questions accurately  
- **CRITICAL: ONLY use links that appear in the CONTEXT section below**
- **NEVER create or invent links that are not explicitly provided in the context**
- Use the exact page titles and URLs from the context
- Be concise but helpful
- If no relevant context is provided, direct users to: [Getting Started](/docs/getting-started/) or [Complete Documentation](/docs/)

**Common starting points**:
- New users: [Getting Started](/docs/getting-started/)
- Install tools: [Installation](/docs/installation/)
- Browse scenarios: [All Scenarios](/docs/scenarios/)
- Full documentation: [Complete Documentation](/docs/)
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
            
            // Standard search limit for all queries
            const searchLimit = 5;
            
            let searchResults = [];
            if (searchLimit > 0) {
                searchResults = await this.documentationIndex.search(query, {
                    limit: searchLimit,
                    threshold: 0.6
                });
            }
            
            // Use sufficient content for LLM to understand context
            const contentLength = 200;
            
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
        
        let systemPrompt = this.systemPrompt;
        
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
