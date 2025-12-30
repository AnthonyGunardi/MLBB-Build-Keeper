const GeminiService = require('../services/gemini');
const { GoogleGenAI } = require('@google/genai');

jest.mock('@google/genai');

describe('GeminiService Guardrails', () => {
  let mockGenerateContent;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock for GoogleGenAI
    mockGenerateContent = jest.fn();
    GoogleGenAI.prototype.models = {
      generateContent: mockGenerateContent
    };

    // Re-instantiate service to pick up the mock. 
    // We overwrite the 'ai' property since the module is already loaded.
    GeminiService.ai = new GoogleGenAI({ apiKey: 'test' });
    GeminiService.ai.models = { generateContent: mockGenerateContent };
  });

  test('should include guardrails in system instruction', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Mock response'
    });

    await GeminiService.chat('Best build for Layla?');

    // Check the arguments passed to generateContent
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const prompt = callArgs.contents;

    expect(prompt).toContain('STRICTLY LIMIT SCOPE to Mobile Legends: Bang Bang (MLBB)');
    expect(prompt).toContain('User Query: Best build for Layla?');
  });

  test('should handle off-topic queries gracefully (simulation)', async () => {
    // This test verifies that we are constructing the prompt correctly.
    // We cannot test the actual model behavior without a real API call.
    // But we can ensure the prompt contains the refusal instructions.

    mockGenerateContent.mockResolvedValue({
      text: 'I can only help with Mobile Legends strategies and guides.' // Simulate refusal
    });

    const response = await GeminiService.chat('What is the capital of France?');

    expect(response).toBe('I can only help with Mobile Legends strategies and guides.');

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const prompt = callArgs.contents;
    expect(prompt).toContain('If the user asks about anything unrelated to MLBB');
  });
});
