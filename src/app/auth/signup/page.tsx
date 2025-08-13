'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/providers/ToastProvider'
import { Zap, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

interface PasswordRequirement {
  text: string
  met: boolean
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { text: 'At least 8 characters long', met: false },
    { text: 'Contains uppercase letter', met: false },
    { text: 'Contains lowercase letter', met: false },
    { text: 'Contains a number', met: false },
  ])

  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkSession()
  }, [router, callbackUrl])

  useEffect(() => {
    // Update password requirements as user types
    const password = formData.password
    setPasswordRequirements([
      { text: 'At least 8 characters long', met: password.length >= 8 },
      { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { text: 'Contains a number', met: /\d/.test(password) },
    ])
  }, [formData.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const allRequirementsMet = passwordRequirements.every(req => req.met)
      if (!allRequirementsMet) {
        newErrors.password = 'Password does not meet requirements'
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        addToast({
          type: 'success',
          description: 'Account created successfully! Signing you in...',
        })

        // Automatically sign in the user after successful registration
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (signInResult?.ok) {
          setTimeout(() => {
            router.push(callbackUrl)
          }, 1000)
        } else {
          addToast({
            type: 'info',
            description: 'Account created! Please sign in with your credentials.',
          })
          router.push('/auth/signin')
        }
      } else {
        addToast({
          type: 'error',
          description: data.error || 'Failed to create account. Please try again.',
        })

        if (response.status === 409) {
          if (data.error.includes('Email')) {
            setErrors({ email: data.error })
          } else if (data.error.includes('Username')) {
            setErrors({ username: data.error })
          }
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      addToast({
        type: 'error',
        description: 'An error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Join the revolution and play Infinite Tic-Tac-Toe
          </p>
        </div>

        {/* Sign Up Form */}
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
              <Input
                name="username"
                type="text"
                label="Username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                disabled={isLoading}
                required
                autoComplete="username"
                className="w-full"
                helperText="3-20 characters, letters, numbers, and underscores only"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
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

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      {requirement.met ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={requirement.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Privacy Policy
              </Link>
              .
            </div>

            <div>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full btn-primary"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            What You'll Get
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Unlimited Online Games</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Friends & Social Features</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Game Statistics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Leaderboards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
