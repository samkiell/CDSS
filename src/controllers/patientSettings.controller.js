import User from '@/models/User';
import UserSession from '@/models/UserSession';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connect';

/**
 * Controller for Patient Settings
 * Handles business logic for fetching and updating patient-specific data.
 */
export const PatientSettingsController = {
  /**
   * Get settings for the current user
   * Returns only the nested settings object as per security constraints.
   * @param {string} userId - The ID of the authenticated user
   */
  async getSettings(userId) {
    await dbConnect();

    // Explicitly select only the settings field to avoid leaking sensitive user data
    const user = await User.findById(userId).select('settings').lean();
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Deep structural defaults: Ensures that even if MongoDB document is missing keys,
    // the API returns a consistent structure to the frontend.
    const settings = {
      profile: {
        firstName: user.settings?.profile?.firstName || '',
        lastName: user.settings?.profile?.lastName || '',
        phone: user.settings?.profile?.phone || '',
        avatarUrl: user.settings?.profile?.avatarUrl || null,
      },
      preferences: {
        language: user.settings?.preferences?.language || 'en',
        notifications: {
          email: user.settings?.preferences?.notifications?.hasOwnProperty('email')
            ? user.settings?.preferences?.notifications.email
            : true,
          sms: user.settings?.preferences?.notifications?.hasOwnProperty('sms')
            ? user.settings?.preferences?.notifications.sms
            : false,
          inApp: user.settings?.preferences?.notifications?.hasOwnProperty('inApp')
            ? user.settings?.preferences?.notifications.inApp
            : true,
        },
      },
      privacy: {
        shareDataForResearch: user.settings?.privacy?.hasOwnProperty(
          'shareDataForResearch'
        )
          ? user.settings?.privacy.shareDataForResearch
          : false,
      },
    };

    return { success: true, settings };
  },

  /**
   * Update patient settings with partial updates and deep merge
   * Rejects unknown fields and validates input types strictly.
   * @param {string} userId - The ID of the authenticated user
   * @param {Object} updateData - Partial settings update object
   */
  async updateSettings(userId, updateData) {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw { status: 400, message: 'Payload cannot be empty' };
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Initialize nested settings objects if the document is new/partially empty
    if (!user.settings) {
      user.settings = {
        profile: {},
        preferences: { notifications: {} },
        privacy: {},
      };
    }

    // Security check: Nested validation and manual field mapping
    // This prevents "pollution" of the database with unwanted fields.
    const allowedTopFields = ['profile', 'preferences', 'privacy'];
    const unknownTopFields = Object.keys(updateData).filter(
      (key) => !allowedTopFields.includes(key)
    );
    if (unknownTopFields.length > 0) {
      throw {
        status: 400,
        message: `Invalid configuration fields: ${unknownTopFields.join(', ')}`,
      };
    }

    // 1. Profile Updates
    if (updateData.profile) {
      const allowedProfileFields = ['firstName', 'lastName', 'phone', 'avatarUrl'];
      const unknownProfileFields = Object.keys(updateData.profile).filter(
        (key) => !allowedProfileFields.includes(key)
      );
      if (unknownProfileFields.length > 0) {
        throw { status: 400, message: `Unknown profile fields detected.` };
      }

      const { firstName, lastName, phone, avatarUrl } = updateData.profile;

      if (firstName !== undefined)
        user.settings.profile.firstName = String(firstName).trim();
      if (lastName !== undefined)
        user.settings.profile.lastName = String(lastName).trim();

      if (phone !== undefined) {
        // Loose phone validation: allows +, digits, spaces, hyphens
        if (phone && !/^[+0-9\s-]{7,20}$/.test(phone)) {
          throw { status: 400, message: 'Invalid phone number format' };
        }
        user.settings.profile.phone = String(phone).trim();
      }

      if (avatarUrl !== undefined) user.settings.profile.avatarUrl = avatarUrl;
    }

    // 2. Preferences Updates (Deep Merge)
    if (updateData.preferences) {
      const { language, notifications } = updateData.preferences;

      if (language !== undefined) {
        const allowedLanguages = ['en', 'fr', 'es'];
        if (!allowedLanguages.includes(language)) {
          throw { status: 400, message: 'Supported languages: en, fr, es' };
        }
        user.settings.preferences.language = language;
      }

      if (notifications) {
        const { email, sms, inApp } = notifications;
        // Strict boolean enforcement as requested
        if (email !== undefined) {
          if (typeof email !== 'boolean')
            throw { status: 400, message: 'Email preference must be boolean' };
          user.settings.preferences.notifications.email = email;
        }
        if (sms !== undefined) {
          if (typeof sms !== 'boolean')
            throw { status: 400, message: 'SMS preference must be boolean' };
          user.settings.preferences.notifications.sms = sms;
        }
        if (inApp !== undefined) {
          if (typeof inApp !== 'boolean')
            throw { status: 400, message: 'In-app preference must be boolean' };
          user.settings.preferences.notifications.inApp = inApp;
        }
      }
    }

    // 3. Privacy Updates
    if (updateData.privacy) {
      const { shareDataForResearch } = updateData.privacy;
      if (shareDataForResearch !== undefined) {
        if (typeof shareDataForResearch !== 'boolean') {
          throw { status: 400, message: 'Privacy setting must be a boolean' };
        }
        user.settings.privacy.shareDataForResearch = shareDataForResearch;
      }
    }

    // Inform Mongoose about the modified nested object to ensure persistence
    user.markModified('settings');
    await user.save();

    return {
      success: true,
      message: 'Settings successfully merged',
      settings: user.settings,
    };
  },

  /**
   * Update User Password
   * @param {string} userId - The ID of the authenticated user
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   */
  async updatePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw { status: 400, message: 'Full credentials required for security' };
    }

    if (newPassword.length < 8) {
      throw { status: 400, message: 'Security policy: Password must be 8+ characters' };
    }

    await dbConnect();
    // Use select('+password') because it is hidden by default in the User Schema
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw { status: 404, message: 'User account not found' };
    }

    // Verify current password before allowing change
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Authentication failed: Incorrect current password' };
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Kill all active sessions to force re-authentication (Security Best Practice)
    if (UserSession) {
      await UserSession.deleteMany({ user: userId });
    }

    return {
      success: true,
      message: 'Credentials updated. Active sessions have been invalidated.',
    };
  },
};
