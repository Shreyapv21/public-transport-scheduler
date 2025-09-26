// const Route = require('../models/Route');
// const Journey = require('../models/Journey');

// class ChatbotService {
//   constructor() {
//     this.intents = {
//       greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
//       routeSearch: ['route', 'journey', 'travel', 'go to', 'from', 'to'],
//       timing: ['when', 'time', 'schedule', 'departure', 'arrival'],
//       fare: ['cost', 'price', 'fare', 'how much'],
//       help: ['help', 'assist', 'support']
//     };
//   }

//   async processMessage(message, userId) {
//     const lowerMessage = message.toLowerCase();
//     const intent = this.detectIntent(lowerMessage);
    
//     switch (intent) {
//       case 'greeting':
//         return this.handleGreeting();
//       case 'routeSearch':
//         return await this.handleRouteSearch(lowerMessage);
//       case 'timing':
//         return await this.handleTimingQuery(lowerMessage);
//       case 'fare':
//         return await this.handleFareQuery(lowerMessage);
//       case 'help':
//         return this.handleHelp();
//       default:
//         return this.handleDefault();
//     }
//   }

//   detectIntent(message) {
//     for (const [intent, keywords] of Object.entries(this.intents)) {
//       if (keywords.some(keyword => message.includes(keyword))) {
//         return intent;
//       }
//     }
//     return 'default';
//   }

//   handleGreeting() {
//     return {
//       message: "Hello! I'm your transport assistant. I can help you find routes, check schedules, and plan your journey. What would you like to know?",
//       suggestions: ["Find a route", "Check schedule", "Plan journey"]
//     };
//   }

//   async handleRouteSearch(message) {
//     const locations = this.extractLocations(message);
    
//     if (locations.from && locations.to) {
//       const filter = {
//         $and: [
//           {
//             $or: [
//               { 'startPoint.name': { $regex: locations.from, $options: 'i' } },
//               { 'startPoint.address': { $regex: locations.from, $options: 'i' } }
//             ]
//           },
//           {
//             $or: [
//               { 'endPoint.name': { $regex: locations.to, $options: 'i' } },
//               { 'endPoint.address': { $regex: locations.to, $options: 'i' } }
//             ]
//           }
//         ]
//       };

//       const routes = await Route.find(filter).limit(3);

//       if (routes.length > 0) {
//         const routeList = routes.map(route => 
//           `🚌 ${route.routeName} (${route.transportType})\n` +
//           `   Duration: ${route.duration} mins | Fare: $${route.fare}`
//         ).join('\n\n');

//         return {
//           message: `I found these routes from ${locations.from} to ${locations.to}:\n\n${routeList}`,
//           routes: routes,
//           suggestions: ["Get detailed schedule", "Find alternative routes", "Plan return journey"]
//         };
//       } else {
//         return {
//           message: `Sorry, I couldn't find direct routes from ${locations.from} to ${locations.to}. Would you like me to suggest alternative routes or nearby stops?`,
//           suggestions: ["Find nearby stops", "Alternative routes", "Different transport types"]
//         };
//       }
//     } else {
//       return {
//         message: "To find routes, please tell me your starting point and destination. For example: 'Route from Central Station to Airport'",
//         suggestions: ["Central Station to Airport", "Downtown to University", "Mall to Hospital"]
//       };
//     }
//   }

//   extractLocations(message) {
//     const fromMatch = message.match(/from\s+([^to]+)/i);
//     const toMatch = message.match(/to\s+(.+)/i);
    
//     return {
//       from: fromMatch ? fromMatch[1].trim() : null,
//       to: toMatch ? toMatch[1].trim() : null
//     };
//   }

//   async handleTimingQuery(message) {
//     return {
//       message: "I can help you check schedules! Please specify a route or tell me your journey details.",
//       suggestions: ["Route 101 schedule", "Next bus to downtown", "Weekend schedules"]
//     };
//   }

//   async handleFareQuery(message) {
//     return {
//       message: "Fare information varies by route and distance. Please specify your journey for accurate pricing.",
//       suggestions: ["Downtown to Airport fare", "Student discounts", "Monthly pass prices"]
//     };
//   }

//   handleHelp() {
//     return {
//       message: "I can help you with:\n" +
//                "🔍 Finding routes between locations\n" +
//                "⏰ Checking schedules and timings\n" +
//                "💰 Getting fare information\n" +
//                "📍 Finding nearby stops\n" +
//                "🗺️ Planning multi-stop journeys\n\n" +
//                "Just tell me what you need!",
//       suggestions: ["Find a route", "Check schedule", "Fare information"]
//     };
//   }

//   handleDefault() {
//     return {
//       message: "I'm not sure I understand. Could you rephrase that? I can help you find routes, check schedules, or plan journeys.",
//       suggestions: ["Find routes", "Check schedules", "Help"]
//     };
//   }
// }

// const chatbotService = new ChatbotService();

// exports.processMessage = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const userId = req.user?.id;
    
//     const response = await chatbotService.processMessage(message, userId);
//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ 
//       message: "Sorry, I'm having trouble processing that. Please try again.",
//       error: error.message 
//     });
//   }
// };

// // Export for socket.io usage
// exports.processChatbotMessage = async (message, userId) => {
//   return await chatbotService.processMessage(message, userId);
// };





require('dotenv').config();
const axios = require("axios");

const LLM_API_KEY = process.env.LLM_API_KEY; // store your key in .env
const SYSTEM_PROMPT = "You are an expert on Swami Vivekananda. Only answer questions related to Swami Vivekananda. If asked about anything else, respond with 'Information not available.'";

exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    // Prepare payload
    const payload = {
      model: "llama3.2-vision:latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7
    };

    // Send request to LLaMA API
    const response = await axios.post(
      "https://chat.ivislabs.in/api/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${LLM_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || "No content returned.";

    // Remove tags like <think>
    const cleanContent = content.replace(/<.*?>/g, "").trim();

    res.json({
      message: cleanContent,
      suggestions: ["Ask another question", "Swami Vivekananda quotes", "Biography info"]
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ 
      message: "Sorry, I'm having trouble processing that. Please try again.",
      error: error.message 
    });
  }
};
