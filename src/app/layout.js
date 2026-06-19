import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import { Toaster } from 'sonner';
import OfflineStatus from '@/components/OfflineStatus';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'CDSS - Clinical Decision Support System',
  description: 'A modern clinical decision support system for healthcare professionals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextAuthProvider>
          <AuthProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster position="top-right" richColors />
                <OfflineStatus />
                <Analytics />
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
