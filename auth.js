import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import connectDB from '@/lib/db/connect';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await connectDB();
        const { email, password } = credentials;
        // Here you would normally fetch the user from your database
        const user = await User.findOne({ email }).select(
          'password email firstName lastName avatar role'
        );
        if (!user) {
          console.log('User not found');
          return null;
        }
        // check password if it's correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        // if password is not correct
        if (!isPasswordValid) {
          console.log('Invalid password');
          return null;
        }

        return {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 1000 * 60 * 60 * 24,
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});
