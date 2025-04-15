// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });

  // Delete token cookie by setting it to empty and maxAge to 0
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
