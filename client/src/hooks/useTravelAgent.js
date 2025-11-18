import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useTravelAgent(userId) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/profile/${userId}`);
      return data;
    },
    enabled: Boolean(userId)
  });

  const updateProfile = useMutation({
    mutationFn: async (profile) => {
      const { data } = await api.post('/api/profile', { userId, profile });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    }
  });

  const sendMessage = useMutation({
    mutationFn: async ({ message, metadata }) => {
      const { data } = await api.post('/api/chat', { userId, message, metadata });
      return data;
    }
  });

  return {
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isFetching,
    profileError: profileQuery.error,
    updateProfile,
    sendMessage
  };
}

