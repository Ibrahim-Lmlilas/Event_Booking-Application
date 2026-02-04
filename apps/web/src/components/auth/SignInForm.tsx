'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login(formData);
      
      // Store token
      localStorage.setItem('token', response.access_token);
      
      toast.success('Login successful! 🎉');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-l p-8 w-full">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.svg"
            alt="Eventzi Logo"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
      </div>

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`h-12 px-4 transition-colors ${
              errors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            className={`h-12 px-4 transition-colors ${
              errors.password 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
            }`}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gray-900 hover:bg-pink-500 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-gray-600 mt-6">
        Don't have an account?{' '}
        {onSwitchToSignUp ? (
          <button 
            type="button"
            onClick={onSwitchToSignUp}
            className="text-gray-900 hover:text-pink-500 font-semibold transition-colors duration-200"
          >
            Sign Up
          </button>
        ) : (
          <Link href="/register" className="text-gray-900 hover:text-pink-500 font-semibold transition-colors duration-200">
            Sign Up
          </Link>
        )}
      </p>
    </div>
  );
}
