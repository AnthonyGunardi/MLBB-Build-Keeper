const geminiService = require('../services/gemini');
const logger = require('../utils/logger');

exports.chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await geminiService.chat(message, context);

    res.status(200).json({
      success: true,
      data: {
        reply: response
      }
    });
  } catch (error) {
    logger.error(`Chat Controller Error: ${error.message}`);

    if (error.message.includes('API Key')) {
      return res.status(503).json({
        success: false,
        message: 'AI Service currently unavailable (Configuration Error)'
      });
    }

    next(error);
  }
};
