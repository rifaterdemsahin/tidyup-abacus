'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (result?.error) {
        setError('Login failed');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Petersfield Mansions
          </CardTitle>
          <CardDescription className="text-base">
            Family Tidying & Inventory App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-base h-12"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="text-base h-12"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Quick Login
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => quickLogin('ece@petersfield.com', 'petersfield2024')}
              disabled={isLoading}
              className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-blue-50 hover:border-blue-300"
            >
              <span className="font-semibold text-base">Ece</span>
              <span className="text-xs text-muted-foreground">Parent</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => quickLogin('erdem@petersfield.com', 'petersfield2024')}
              disabled={isLoading}
              className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-purple-50 hover:border-purple-300"
            >
              <span className="font-semibold text-base">Erdem</span>
              <span className="text-xs text-muted-foreground">Parent</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => quickLogin('arya@petersfield.com', 'petersfield2024')}
              disabled={isLoading}
              className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-pink-50 hover:border-pink-300"
            >
              <span className="font-semibold text-base">Arya</span>
              <span className="text-xs text-muted-foreground">9 years</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => quickLogin('mira@petersfield.com', 'petersfield2024')}
              disabled={isLoading}
              className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300"
            >
              <span className="font-semibold text-base">Mira</span>
              <span className="text-xs text-muted-foreground">3 years</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
