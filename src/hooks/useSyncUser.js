// src/hooks/useSyncUser.js
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import API from '../api/axios'; // Your axios instance

export const useCurrentUser = () => {
  const { isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = await getToken();
      const response = await API.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.user;
    },
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};