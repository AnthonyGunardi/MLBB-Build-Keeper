import api from '../api/axios';

const BuildService = {
  getBuilds: async heroId => {
    const response = await api.get(`/heroes/${heroId}/builds`);
    return response.data;
  },

  createBuild: async (heroId, formData, onUploadProgress) => {
    const response = await api.post(`/heroes/${heroId}/builds`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return response.data;
  },

  deleteBuild: async id => {
    const response = await api.delete(`/builds/${id}`);
    return response.data;
  },

  reorderBuilds: async (heroId, buildIds) => {
    const response = await api.put(`/heroes/${heroId}/builds/reorder`, { buildIds });
    return response.data;
  }
};

export default BuildService;
