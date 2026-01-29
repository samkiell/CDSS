import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/connect';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const user = await User.findOne({
            email: String(credentials.email).toLowerCase(),
          }).select('password email firstName lastName avatar role isVerified');

          if (!user) return null;

          const isPasswordValid = await bcrypt.compare(
            String(credentials.password),
            user.password
          );

          if (!isPasswordValid) return null;
          if (!user.isVerified) return null;

          // Track Session
          let sessionId = null;
          try {
            const { headers } = await import('next/headers');
            const headerList = await headers();
            const userAgent = headerList.get('user-agent') || 'Unknown Device';
            const ip = headerList.get('x-forwarded-for') || 'Unknown IP';

            // Simple parsing for device name
            let device = 'Unknown Device';
            if (userAgent) {
              if (userAgent.includes('Windows')) device = 'Windows PC';
              else if (userAgent.includes('Macintosh')) device = 'Mac';
              else if (userAgent.includes('Linux')) device = 'Linux PC';
              else if (userAgent.includes('Android')) device = 'Android Device';
              else if (userAgent.includes('iPhone')) device = 'iPhone';
              else if (userAgent.includes('iPad')) device = 'iPad';

              if (userAgent.includes('Chrome')) device = `Chrome on ${device}`;
              else if (userAgent.includes('Firefox')) device = `Firefox on ${device}`;
              else if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
                device = `Safari on ${device}`;
              else if (userAgent.includes('Edge')) device = `Edge on ${device}`;
            }

            const { UserSession } = await import('@/models');

            const sessionLog = await UserSession.create({
              user: user._id,
              device,
              ip: ip.split(',')[0].trim(), // Get first IP if multiple
              userAgent,
              lastActive: new Date(),
            });
            sessionId = sessionLog._id.toString();
          } catch (sessionError) {
            console.error('Failed to create session log:', sessionError);
          }

          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar || null,
            sessionId,
          };
        } catch (error) {
          console.error('Auth authorize error:', error);
          return null;
        }
      },
    }),
  ],
});
