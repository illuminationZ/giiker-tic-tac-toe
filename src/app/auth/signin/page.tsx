"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { Zap, Eye, EyeOff } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");

  useEffect(() => {
    if (error) {
      addToast({
        type: "error",
        description: "Invalid credentials. Please try again.",
      });
    }
  }, [error, addToast]);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [router, callbackUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      console.log("Sign in result:", result);
      if (result?.error) {
        addToast({
          type: "error",
          description: "Invalid email or password. Please try again.",
        });
      } else if (result?.ok) {
        addToast({
          type: "success",
          description: "Welcome back! Redirecting...",
        });
        // Manual redirect after successful sign-in
        console.log("Redirecting to:", callbackUrl);
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      addToast({
        type: "error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              GiiKER Tic-Tac-Toe
            </h1>
          </div>
          <h2 className="text-xl text-gray-600 dark:text-gray-400">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Experience the revolutionary Infinite Tic-Tac-Toe online
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                disabled={isLoading}
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full btn-primary"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Why Play GiiKER Tic-Tac-Toe?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Revolutionary Infinite Mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Play with Friends Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Track Your Game History</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Real-time Multiplayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
