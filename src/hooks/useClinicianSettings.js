'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const fetchSettings = async () => {
  const { data } = await axios.get('/api/clinician/settings');
  return data;
};

const fetchSecuritySettings = async () => {
  const { data } = await axios.get('/api/clinician/settings/security');
  return data;
};

export function useClinicianSettings() {
  const queryClient = useQueryClient();
  const { update: updateSession } = useSession();
  const router = useRouter();

  // Fetch all settings
  const query = useQuery({
    queryKey: ['clinician-settings'],
    queryFn: fetchSettings,
  });

  const securityQuery = useQuery({
    queryKey: ['clinician-security'],
    queryFn: fetchSecuritySettings,
  });

  // Generic mutation helper for optimistic updates
  const createMutation = (endpoint, key, successMessage) => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await axios.patch(`/api/clinician/settings/${endpoint}`, data);
        return response.data;
      },
      onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey: ['clinician-settings'] });
        const previousSettings = queryClient.getQueryData(['clinician-settings']);

        // Optimistically update
        if (previousSettings && previousSettings[key]) {
          // Basic optimistic update - only works if structure matches exactly
          // For deeply nested or complex updates, we might want to skip this or be more careful
          queryClient.setQueryData(['clinician-settings'], (old) => ({
            ...old,
            [key]: { ...old[key], ...newData },
          }));
        }

        return { previousSettings };
      },
      onError: (err, newData, context) => {
        if (context?.previousSettings) {
          queryClient.setQueryData(['clinician-settings'], context.previousSettings);
        }
        toast.error(`Error: ${err.response?.data?.error || err.message}`);
      },
      onSuccess: () => {
        toast.success(successMessage);
        queryClient.invalidateQueries({ queryKey: ['clinician-settings'] });
        router.refresh();
      },
    });
  };

  const updateProfile = createMutation(
    'profile',
    'profile',
    'Profile updated successfully'
  );

  // Update session for profile changes specifically
  const originalUpdateProfile = updateProfile.mutate;
  updateProfile.mutate = (data) => {
    originalUpdateProfile(data, {
      onSuccess: async () => {
        // If we updated name, we should push that to the session
        if (data.firstName || data.lastName) {
          await updateSession({
            firstName: data.firstName,
            lastName: data.lastName,
          });
          router.refresh();
        }
      },
    });
  };
  const updateProfessional = createMutation(
    'professional',
    'professional',
    'Professional details updated'
  );

  const updateClinical = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch('/api/clinician/settings/clinical', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Clinical preferences saved');
      queryClient.invalidateQueries({ queryKey: ['clinician-settings'] });
      router.refresh();
    },
    onError: (err) => {
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    },
  });

  const updateAvailability = createMutation(
    'availability',
    'availability',
    'Availability schedule updated'
  );
  const updateNotifications = createMutation(
    'notifications',
    'notifications',
    'Notification preferences updated'
  );

  // Avatar Upload
  const uploadAvatar = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('/api/clinician/settings/avatar', formData);
      return data;
    },
    onSuccess: async (data) => {
      toast.success('Avatar updated');
      queryClient.setQueryData(['clinician-settings'], (old) => {
        if (!old) return old;
        return {
          ...old,
          profile: { ...old.profile, avatarUrl: data.avatarUrl },
        };
      });
      await queryClient.invalidateQueries({ queryKey: ['clinician-settings'] });
      await updateSession({ image: data.avatarUrl }); // Force session update
      router.refresh();
    },
    onError: (err) => {
      toast.error('Failed to upload avatar');
    },
  });

  // Security Mutations
  const changePassword = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch('/api/clinician/settings/security', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to change password');
    },
  });

  const toggle2FA = useMutation({
    mutationFn: async (enabled) => {
      const response = await axios.patch('/api/clinician/settings/security', {
        twoFactorEnabled: enabled,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`2FA ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: ['clinician-security'] });
    },
    onError: (err) => {
      toast.error('Failed to update 2FA settings');
    },
  });

  const logoutAllSessions = useMutation({
    mutationFn: async () => {
      const response = await axios.delete('/api/clinician/settings/security');
      return response.data;
    },
    onSuccess: () => {
      toast.success('All other sessions logged out');
      queryClient.invalidateQueries({ queryKey: ['clinician-security'] });
      router.refresh();
    },
    onError: (err) => {
      toast.error('Failed to log out sessions');
    },
  });

  const logoutIndividualSession = useMutation({
    mutationFn: async (sessionId) => {
      const response = await axios.delete(
        `/api/clinician/settings/security?sessionId=${sessionId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Session logged out successfully');
      queryClient.invalidateQueries({ queryKey: ['clinician-security'] });
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to log out session');
    },
  });

  return {
    settings: query.data,
    securitySettings: securityQuery.data,
    isLoading: query.isLoading || securityQuery.isLoading,
    isError: query.isError || securityQuery.isError,
    error: query.error || securityQuery.error,
    updateProfile,
    updateProfessional,
    updateClinical,
    updateAvailability,
    updateNotifications,
    uploadAvatar,
    changePassword,
    toggle2FA,
    logoutAllSessions,
    logoutIndividualSession,
  };
}
