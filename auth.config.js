export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.avatar = user.avatar;
        token.sessionId = user.sessionId;
      }

      if (trigger === 'update' && session) {
        // Allow updating user details in the session
        if (session.image) token.avatar = session.image;
        if (session.firstName) token.firstName = session.firstName;
        if (session.lastName) token.lastName = session.lastName;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.sessionId = token.sessionId;
      }
      return session;
    },
  },
  providers: [], // We will add providers in auth.js
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
};
