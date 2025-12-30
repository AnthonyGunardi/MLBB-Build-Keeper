import api from '../api/axios';

const HeroService = {
  getAllHeroes: async params => {
    const response = await api.get('/heroes', { params });
    return response.data;
  },

  createHero: async formData => {
    const response = await api.post('/heroes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteHero: async id => {
    const response = await api.delete(`/heroes/${id}`);
    return response.data;
  }
};

export default HeroService;
