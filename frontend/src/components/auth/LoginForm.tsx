import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Define the validation schema using Zod
const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Infer the type from the schema
type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login({ identifier: data.identifier, password: data.password });
      navigate('/dashboard');
    } catch (error) {
      // The error is already toasted in the context, but we can add form-specific errors if needed
      setError('root', {
        type: 'manual',
        message: 'Login failed. Please check your credentials.',
      });
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Sign in to your account
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && <p className="text-sm text-red-600 text-center">{errors.root.message}</p>}
        <div>
          <label
            htmlFor="identifier"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your Identifier
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              id="identifier"
              {...register('identifier')}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="username"
            />
          </div>
          {errors.identifier && <p className="mt-2 text-sm text-red-600">{errors.identifier.message}</p>}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="rememberMe" className="text-gray-500 dark:text-gray-300">
                Remember me
              </label>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            'Signing in...'
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              Sign in
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
