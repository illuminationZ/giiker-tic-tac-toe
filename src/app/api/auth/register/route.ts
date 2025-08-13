import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateEmail, validateUsername, validatePassword } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate username
    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
