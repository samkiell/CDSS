export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Only store essential identification in the token to keep cookie size small
        // This prevents HTTP 431 "Request Header Fields Too Large" errors
        token.id = user.id;
        token.role = user.role;
        token.sessionId = user.sessionId;
      }

      if (trigger === 'update' && session) {
        // We can still allow updates if needed, but keep it minimal
        if (session.sessionId) token.sessionId = session.sessionId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.sessionId = token.sessionId;
      }
      return session;
    },
  },
  providers: [], // We will add providers in auth.js
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `cdss.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.AUTH_SECRET,
};
