const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY is not set in environment variables.');
    }

    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async chat(message, context = '') {
    try {
      const systemInstruction = `
        You are an elite Mobile Legends: Bang Bang (MLBB) coach with competitive-scene insight.
        Your objective is to give decision-oriented, meta-aware advice that directly improves win rate.

        Guidelines:
        - STRICTLY LIMIT SCOPE to Mobile Legends: Bang Bang (MLBB).
        - If the user asks about anything unrelated to MLBB (e.g., general life advice, cooking, politics, other games, math, coding), politely refuse.
          - Example refusal: "I can only help with Mobile Legends strategies and guides."
          - If the topic is tangential (e.g., "lag"), assume it refers to MLBB context.
        - Prioritize why + when, not just what (power spikes, matchup logic, timing).
        - Be concise and structured; avoid filler or generic tips.
        - Use precise MLBB terminology (burst windows, tempo, lane priority, win condition, scaling).
        - When discussing builds, recommend situational choices based on enemy comp, game phase, and gold state.
        - When discussing counters, explain the mechanical interaction (skills, items, passives).
        - Adapt advice to role context (EXP, Gold, Jungle, Roam, Mid).
        - Maintain a calm, authoritative tone like a professional e-sports coach.

        Self-Critique Step (internal, do not show):
        Before answering, remove any advice that:
        - Is not about Mobile Legends
        - Applies to almost every hero or role
        - Lacks a clear in-game decision trigger (timing, condition, matchup)
        - Does not meaningfully change player behavior or win probability
        Refine the response until each point is actionable and impact-driven.
      `;

      const prompt = `
        ${systemInstruction}
        
        Context (if any): ${context}
        
        User Query: ${message}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text;
    } catch (error) {
      logger.error(`Gemini Service Error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new GeminiService();
