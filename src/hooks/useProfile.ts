import { API_CONFIG, queryKeys } from '@/constants';
import { profileService } from '@/services/supabase';
import { useAuthStore } from '@/stores';
import { UpdateProfileData, UserProfile } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useProfile = () => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: queryKeys.profile.detail(user?.id),
    queryFn: () => profileService.getProfile(user!.id),
    enabled: !!user,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      profileService.updateProfile(user!.id, data),
    onMutate: async newProfile => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.profile.detail(user?.id),
      });

      // Snapshot
      const previousProfile = queryClient.getQueryData(
        queryKeys.profile.detail(user?.id),
      );

      // Optimistic update
      queryClient.setQueryData(
        queryKeys.profile.detail(user?.id),
        (old: any) => {
          if (!old) return old;
          return { ...old, ...newProfile };
        },
      );

      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.profile.detail(user?.id),
          context.previousProfile,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.detail(user?.id),
      });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: (file: { uri: string; type?: string; name?: string }) =>
      profileService.uploadAvatar(user!.id, file),
    onSuccess: avatarUrl => {
      queryClient.setQueryData(
        queryKeys.profile.detail(user?.id),
        (old: UserProfile) => {
          if (!old) return old;
          return { ...old, avatarUrl };
        },
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.detail(user?.id),
      });
    },
  });
};
