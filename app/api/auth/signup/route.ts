import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
      },
    });

    if (process.env.NODE_ENV === 'production') {
      // Send POST to external endpoint
      const externalResponse = await fetch('https://themiracle.love/completeSignup.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name || '',
          verificationToken: user.verificationToken,
        }),
      });

      if (!externalResponse.ok) {
        console.error('Failed to send to external endpoint');
        // Optionally, you can delete the user or handle error
      }
    } else {
      // In development, console log the verification link
      console.log(`Verification link: /verify-email?email=${encodeURIComponent(user.email)}&code=${user.verificationToken}`);
    }

    return NextResponse.json({ message: 'User created. Please check your email for verification.' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}