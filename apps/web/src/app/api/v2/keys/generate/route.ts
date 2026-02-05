/**
 * POST /api/v2/keys/generate - Generate a new API key
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, permissions = ['read'] } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'API key name required' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions = ['read', 'write'];
    const invalidPerms = permissions.filter((p: string) => !validPermissions.includes(p));
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { error: `Invalid permissions: ${invalidPerms.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate API key (format: sub_live_xxxxxxxxxxxxxxxxxxxxx)
    const keyBytes = randomBytes(32);
    const rawKey = `sub_live_${keyBytes.toString('base64url')}`;

    // Hash the key for storage
    const hashedKey = await hash(rawKey, 10);

    // Store in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        key: hashedKey,
        name,
        permissions
      }
    });

    // Return the raw key ONCE (it won't be shown again)
    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey, // Only returned once
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt
      },
      warning: 'Store this key securely. It will not be shown again.'
    });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
