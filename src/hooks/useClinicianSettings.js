import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const fetchSettings = async () => {
  const { data } = await axios.get('/api/clinician/settings');
  return data;
};

export function useClinicianSettings() {
  const queryClient = useQueryClient();

  // Fetch all settings
  const query = useQuery({
    queryKey: ['clinician-settings'],
    queryFn: fetchSettings,
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
        if (previousSettings) {
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
        toast.error(`Failed to update ${key}: ${err.message}`);
      },
      onSuccess: () => {
        toast.success(successMessage);
        queryClient.invalidateQueries({ queryKey: ['clinician-settings'] });
      },
    });
  };

  const updateProfile = createMutation(
    'profile',
    'profile',
    'Profile updated successfully'
  );
  const updateProfessional = createMutation(
    'professional',
    'professional',
    'Professional details updated'
  );
  const updateClinical = createMutation(
    'clinical',
    'clinicalPreferences',
    'Clinical preferences saved'
  ); // Key mismatch in API vs Frontend object? API route returns 'clinical', frontend object has 'clinicalPreferences'.
  // API GET route maps 'clinical' (db) to 'clinicalPreferences' (response).
  // API PATCH /clinical updates 'clinical' in DB.
  // The mutation updates via PATCH /clinical.
  // I must be careful about the key mapping.
  // get route returns: { clinicalPreferences: ... }
  // So the key in cache is 'clinicalPreferences'.
  // The endpoint is 'clinical'.

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
    onSuccess: (data) => {
      toast.success('Avatar updated');
      queryClient.setQueryData(['clinician-settings'], (old) => {
        if (!old) return old;
        return {
          ...old,
          profile: { ...old.profile, avatarUrl: data.avatarUrl },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['clinician-settings'] });
    },
    onError: (err) => {
      toast.error('Failed to upload avatar');
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateProfile,
    updateProfessional,
    updateClinical: useMutation({
      // Custom override for key mismatch
      mutationFn: async (data) => {
        const response = await axios.patch('/api/clinician/settings/clinical', data);
        return response.data;
      },
      onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey: ['clinician-settings'] });
        const previousSettings = queryClient.getQueryData(['clinician-settings']);
        if (previousSettings) {
          queryClient.setQueryData(['clinician-settings'], (old) => ({
            ...old,
            clinicalPreferences: { ...old.clinicalPreferences, ...newData },
          }));
        }
        return { previousSettings };
      },
      onError: (err, newData, context) => {
        if (context?.previousSettings) {
          queryClient.setQueryData(['clinician-settings'], context.previousSettings);
        }
        toast.error('Failed to update clinical preferences');
      },
      onSuccess: () => {
        toast.success('Clinical preferences saved');
        queryClient.invalidateQueries({ queryKey: ['clinician-settings'] });
      },
    }),
    updateAvailability,
    updateNotifications,
    uploadAvatar,
  };
}
