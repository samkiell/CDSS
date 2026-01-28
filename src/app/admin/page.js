'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Logo,
  Button,
  Input,
  PasswordInput,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Login failed: Invalid Admin Credentials.');
      } else {
        toast.success('Admin authenticated successfully!');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred during login.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="animate-fade-in mb-8">
        <Logo size="lg" />
      </div>

      <Card className="animate-slide-up border-t-primary w-full max-w-md border-t-4 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>Enter your high-level credentials to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300"
              >
                Admin Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@cdss.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="focus:ring-primary/20 h-12 border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300"
              >
                Security Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="focus:ring-primary/20 h-12 border-gray-200 dark:border-gray-800"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-lg font-bold shadow-lg"
              loading={isLoading}
            >
              Access Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-gray-400">
        &copy; 2026 CDSS Diagnostic Platform. Restricted Access.
      </p>
    </div>
  );
}
