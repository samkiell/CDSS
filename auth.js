import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/connect';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
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
  callbacks: {
    // Preserve the edge-safe callbacks from authConfig (jwt/session) and add
    // DB-backed logic that can only run in this Node runtime.
    ...authConfig.callbacks,

    /**
     * Provision or link a local User record for Google sign-ins.
     * Runs in the Node runtime (Mongoose available).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true;

      try {
        await connectDB();
        const email = (profile?.email || user?.email || '').toLowerCase();
        if (!email) return false;
        // Google only asserts the email if it is verified.
        if (profile?.email_verified === false) return false;

        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            email,
            firstName: profile?.given_name || user?.name?.split(' ')[0] || 'User',
            lastName:
              profile?.family_name ||
              user?.name?.split(' ').slice(1).join(' ') ||
              '',
            authProvider: 'google',
            googleId: profile?.sub || account?.providerAccountId || null,
            avatar: profile?.picture || user?.image || null,
            isVerified: true,
          });
        } else if (!dbUser.googleId) {
          // Link Google to an existing local account.
          dbUser.googleId = profile?.sub || account?.providerAccountId || null;
          if (!dbUser.avatar && (profile?.picture || user?.image)) {
            dbUser.avatar = profile?.picture || user?.image;
          }
          dbUser.isVerified = true;
          await dbUser.save();
        }
        return true;
      } catch (error) {
        console.error('Google signIn provisioning error:', error);
        return false;
      }
    },

    /**
     * Enrich the JWT. For Google sign-ins the `user` arg is the Google profile,
     * so we look up our own User to attach the canonical id + role. Then defer
     * to the edge-safe jwt callback for any further shaping.
     */
    async jwt(params) {
      const { token, account, user } = params;
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const email = (user?.email || token.email || '').toLowerCase();
          if (email) {
            const dbUser = await User.findOne({ email }).select('_id role');
            if (dbUser && user) {
              // Inject our canonical id/role into `user` so the shared jwt
              // callback (which reads from `user`) persists them correctly
              // instead of overwriting with the Google profile's undefined.
              user.id = dbUser._id.toString();
              user.role = dbUser.role;
            }
          }
        } catch (error) {
          console.error('Google jwt enrich error:', error);
        }
      }
      // Run the shared (edge-safe) jwt logic for credentials + token shaping.
      return authConfig.callbacks.jwt(params);
    },
  },
});
