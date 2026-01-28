'use client';

import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children }) {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}
