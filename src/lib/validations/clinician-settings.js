import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const professionalSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseBody: z.string().min(1, 'License issuing body is required'),
  experienceYears: z.coerce.number().min(0, 'Experience years must be positive'),
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  primaryPracticeArea: z.string().min(1, 'Primary practice area is required'),
});

export const clinicalPreferencesSchema = z.object({
  defaultModules: z.array(z.string()),
  painScale: z.enum(['VAS']),
  autoSuggestTests: z.boolean(),
});

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  timeSlots: z.array(
    z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    })
  ),
});

export const availabilitySchema = z.object({
  timezone: z.string(), // Locked to profile timezone usually
  sessionBuffer: z.coerce.number().min(0),
  acceptNewPatients: z.boolean(),
  weeklySchedule: z.object({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema,
  }),
});

export const notificationsSchema = z.object({
  email: z.boolean(),
  inApp: z.boolean(),
  events: z.array(z.string()),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
