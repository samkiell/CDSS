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

          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar || null,
          };
        } catch (error) {
          console.error('Auth authorize error:', error);
          return null;
        }
      },
    }),
  ],
});
