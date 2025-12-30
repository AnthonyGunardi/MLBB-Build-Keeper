const logger = require('../utils/logger');

// Mock GoogleGenAI before requiring the service
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent
    }
  }))
}));
jest.mock('../utils/logger');

describe('GeminiService', () => {
  let GeminiServiceClass;
  let geminiService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module to get a fresh instance
    jest.resetModules();

    // Set up mock again after reset
    mockGenerateContent.mockClear();
    jest.mock('@google/genai', () => ({
      GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }))
    }));
    jest.mock('../utils/logger');
  });

  describe('constructor', () => {
    it('should log warning when GEMINI_API_KEY is not set', () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      jest.resetModules();
      // Re-mock after reset
      jest.doMock('@google/genai', () => ({
        GoogleGenAI: jest.fn().mockImplementation(() => ({
          models: { generateContent: mockGenerateContent }
        }))
      }));
      const mockLogger = { warn: jest.fn(), error: jest.fn() };
      jest.doMock('../utils/logger', () => mockLogger);

      require('../services/gemini');

      expect(mockLogger.warn).toHaveBeenCalledWith('GEMINI_API_KEY is not set in environment variables.');

      // Restore
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    });

    it('should not log warning when GEMINI_API_KEY is set', () => {
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'test-api-key';

      jest.resetModules();
      jest.doMock('@google/genai', () => ({
        GoogleGenAI: jest.fn().mockImplementation(() => ({
          models: { generateContent: mockGenerateContent }
        }))
      }));
      const mockLogger = { warn: jest.fn(), error: jest.fn() };
      jest.doMock('../utils/logger', () => mockLogger);

      require('../services/gemini');

      expect(mockLogger.warn).not.toHaveBeenCalled();

      // Restore
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      } else {
        delete process.env.GEMINI_API_KEY;
      }
    });
  });

  describe('chat', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      jest.resetModules();
      jest.doMock('@google/genai', () => ({
        GoogleGenAI: jest.fn().mockImplementation(() => ({
          models: { generateContent: mockGenerateContent }
        }))
      }));
      jest.doMock('../utils/logger', () => ({ warn: jest.fn(), error: jest.fn() }));
      geminiService = require('../services/gemini');
    });

    it('should return response text from AI model', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'AI response here' });

      const result = await geminiService.chat('What build for Layla?');

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-flash',
          contents: expect.stringContaining('What build for Layla?')
        })
      );
      expect(result).toBe('AI response here');
    });

    it('should include context in prompt when provided', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Response with context' });

      await geminiService.chat('Any tips?', 'Playing as marksman');

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: expect.stringContaining('Playing as marksman')
        })
      );
    });

    it('should log and throw error on API failure', async () => {
      const apiError = new Error('API rate limit exceeded');
      mockGenerateContent.mockRejectedValue(apiError);

      const mockLogger = require('../utils/logger');

      await expect(geminiService.chat('Hello')).rejects.toThrow('API rate limit exceeded');
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Gemini Service Error:'));
    });
  });
});
