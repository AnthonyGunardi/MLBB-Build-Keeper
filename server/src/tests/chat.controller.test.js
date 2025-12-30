const chatController = require('../controllers/chat');
const geminiService = require('../services/gemini');
const logger = require('../utils/logger');

jest.mock('../services/gemini');
jest.mock('../utils/logger');

describe('ChatController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should return AI response for valid message', async () => {
      req.body = { message: 'What is the best build for Layla?' };
      geminiService.chat.mockResolvedValue('Use Windtalker for attack speed...');

      await chatController.chat(req, res, next);

      expect(geminiService.chat).toHaveBeenCalledWith('What is the best build for Layla?', undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { reply: 'Use Windtalker for attack speed...' }
      });
    });

    it('should pass context to gemini service when provided', async () => {
      req.body = { message: 'Any tips?', context: 'Playing as marksman' };
      geminiService.chat.mockResolvedValue('Focus on positioning...');

      await chatController.chat(req, res, next);

      expect(geminiService.chat).toHaveBeenCalledWith('Any tips?', 'Playing as marksman');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if message is missing', async () => {
      req.body = {};

      await chatController.chat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message is required'
      });
      expect(geminiService.chat).not.toHaveBeenCalled();
    });

    it('should return 400 if message is empty string', async () => {
      req.body = { message: '' };

      await chatController.chat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message is required'
      });
    });

    it('should return 503 when API Key error occurs', async () => {
      req.body = { message: 'Hello' };
      const apiKeyError = new Error('API Key is invalid');
      geminiService.chat.mockRejectedValue(apiKeyError);

      await chatController.chat(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'AI Service currently unavailable (Configuration Error)'
      });
    });

    it('should call next with error for other failures', async () => {
      req.body = { message: 'Hello' };
      const genericError = new Error('Network timeout');
      geminiService.chat.mockRejectedValue(genericError);

      await chatController.chat(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(genericError);
    });
  });
});
