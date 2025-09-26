require('dotenv').config();
const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Your OpenRouter API key
const SYSTEM_PROMPT = `
You are a transport assistant. Answer queries about routes, fares, schedules, timings, and journey planning. 
Do not provide unrelated information. 
If unsure, respond politely that you cannot provide a precise answer.
`;

class ChatbotService {
  constructor() {
    this.intents = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      routeSearch: ['route', 'journey', 'travel', 'go to', 'from', 'to'],
      timing: ['when', 'time', 'schedule', 'departure', 'arrival'],
      fare: ['cost', 'price', 'fare', 'how much'],
      help: ['help', 'assist', 'support']
    };
  }

  async processMessage(message, userId) {
    const lowerMessage = message.toLowerCase();
    const intent = this.detectIntent(lowerMessage);

    // Handle basic intents locally
    switch (intent) {
      case 'greeting': return this.handleGreeting();
      case 'help': return this.handleHelp();
      default: return await this.queryOpenRouter(message, intent);
    }
  }

  detectIntent(message) {
    for (const [intent, keywords] of Object.entries(this.intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }
    return 'default';
  }

  handleGreeting() {
    return {
      message: "Hello! I'm your transport assistant. I can help you find routes, check schedules, and plan your journey. What would you like to know?",
      suggestions: ["Find a route", "Check schedule", "Plan journey"]
    };
  }

  handleHelp() {
    return {
      message: "I can help you with:\n" +
               "🔍 Finding routes between locations\n" +
               "⏰ Checking schedules and timings\n" +
               "💰 Getting fare information\n" +
               "📍 Finding nearby stops\n" +
               "🗺️ Planning multi-stop journeys\n\n" +
               "Just tell me what you need!",
      suggestions: ["Find a route", "Check schedule", "Fare information"]
    };
  }

  async queryOpenRouter(message, intent) {
    try {
      const payload = {
        model: "deepseek/deepseek-chat-v3.1", // OpenRouter free version
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.7
      };

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        payload,
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const content = response.data?.choices?.[0]?.message?.content 
                      || response.data?.output
                      || "Sorry, I couldn't generate a response.";

      return {
        message: content.replace(/<.*?>/g, "").trim(),
        suggestions: ["Find another route", "Check schedule", "Fare info"]
      };

    } catch (error) {
      console.error("OpenRouter API error:", error.response?.data || error.message);
      return {
        message: "Sorry, I'm having trouble processing that. Please try again later.",
        suggestions: ["Find a route", "Check schedule", "Help"]
      };
    }
  }
}

const chatbotService = new ChatbotService();

// Express route usage
exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || "anonymous";

    const response = await chatbotService.processMessage(message, userId);
    res.json(response);

  } catch (error) {
    res.status(500).json({ 
      message: "Sorry, I'm having trouble processing that. Please try again.",
      error: error.message 
    });
  }
};

// Export for socket.io usage
exports.processChatbotMessage = async (message, userId) => {
  return await chatbotService.processMessage(message, userId);
};
