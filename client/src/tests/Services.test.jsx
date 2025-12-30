import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import AuthService from '../services/authService';
import HeroService from '../services/heroService';
import BuildService from '../services/buildService';
import chatService from '../services/chatService';

vi.mock('../api/axios');

describe('Client Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthService', () => {
    it('login calls api.post', async () => {
      api.post.mockResolvedValue({ data: { token: 'abc' } });
      const res = await AuthService.login('email', 'pass');
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'email', password: 'pass' });
      expect(res).toEqual({ token: 'abc' });
    });

    it('register calls api.post', async () => {
      api.post.mockResolvedValue({ data: { token: 'abc' } });
      const res = await AuthService.register('user', 'email', 'pass');
      expect(api.post).toHaveBeenCalledWith('/auth/register', { username: 'user', email: 'email', password: 'pass' });
      expect(res).toEqual({ token: 'abc' });
    });

    it('getMe calls api.get', async () => {
      api.get.mockResolvedValue({ data: { id: 1 } });
      const res = await AuthService.getMe();
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(res).toEqual({ id: 1 });
    });
  });

  describe('HeroService', () => {
    it('getAllHeroes calls api.get', async () => {
      api.get.mockResolvedValue({ data: [] });
      await HeroService.getAllHeroes();
      expect(api.get).toHaveBeenCalledWith('/heroes', { params: undefined });
    });

    it('createHero calls api.post with headers', async () => {
      api.post.mockResolvedValue({ data: {} });
      const formData = new FormData();
      await HeroService.createHero(formData);
      expect(api.post).toHaveBeenCalledWith(
        '/heroes',
        formData,
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('deleteHero calls api.delete', async () => {
      api.delete.mockResolvedValue({ data: {} });
      await HeroService.deleteHero(1);
      expect(api.delete).toHaveBeenCalledWith('/heroes/1');
    });
  });

  describe('BuildService', () => {
    it('getBuilds calls api.get', async () => {
      api.get.mockResolvedValue({ data: [] });
      await BuildService.getBuilds(1);
      expect(api.get).toHaveBeenCalledWith('/heroes/1/builds');
    });

    it('createBuild calls api.post with headers', async () => {
      api.post.mockResolvedValue({ data: {} });
      const formData = new FormData();
      await BuildService.createBuild(1, formData);
      expect(api.post).toHaveBeenCalledWith(
        '/heroes/1/builds',
        formData,
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('deleteBuild calls api.delete', async () => {
      api.delete.mockResolvedValue({ data: {} });
      await BuildService.deleteBuild(1);
      expect(api.delete).toHaveBeenCalledWith('/builds/1');
    });

    it('reorderBuilds calls api.put', async () => {
      api.put.mockResolvedValue({ data: {} });
      await BuildService.reorderBuilds(1, [1, 2]);
      expect(api.put).toHaveBeenCalledWith('/heroes/1/builds/reorder', { buildIds: [1, 2] });
    });
  });

  describe('chatService', () => {
    it('sendMessage calls api.post with message', async () => {
      api.post.mockResolvedValue({ data: { data: { reply: 'AI response' } } });
      const res = await chatService.sendMessage('What build for Layla?');
      expect(api.post).toHaveBeenCalledWith('/chat', { message: 'What build for Layla?', context: '' });
      expect(res).toBe('AI response');
    });

    it('sendMessage includes context when provided', async () => {
      api.post.mockResolvedValue({ data: { data: { reply: 'Contextual response' } } });
      const res = await chatService.sendMessage('Any tips?', 'Playing as marksman');
      expect(api.post).toHaveBeenCalledWith('/chat', { message: 'Any tips?', context: 'Playing as marksman' });
      expect(res).toBe('Contextual response');
    });

    it('sendMessage throws on API error', async () => {
      api.post.mockRejectedValue(new Error('Network error'));
      await expect(chatService.sendMessage('Hello')).rejects.toThrow('Network error');
    });
  });
});
