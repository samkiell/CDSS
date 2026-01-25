import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';
import OfflineStatus from '@/components/OfflineStatus';
import { SessionProvider } from 'next-auth/react';
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" richColors />
            <OfflineStatus />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
