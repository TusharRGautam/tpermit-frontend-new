import { API_CONFIG } from '../config';

export const showroomService = {
  getAllShowrooms: async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/showrooms`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch showrooms');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching showrooms:', error);
      throw error;
    }
  },

  getShowroomsByBrand: async (brand) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/showrooms/brand/${encodeURIComponent(brand)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch showrooms by brand');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching showrooms by brand:', error);
      throw error;
    }
  }
};