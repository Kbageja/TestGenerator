// src/hooks/useSyncUser.js
import { useMutation } from '@tanstack/react-query';
import API from '../services/api';

export const useSyncUser = () => {
  return useMutation({
    mutationFn: async (token) => {
      const response = await API.post('/api/auth/sync', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    }
  });
};
