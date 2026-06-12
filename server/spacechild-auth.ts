/**
 * Space Child SSO Federation
 *
 * Federates authentication with the standalone Space Child auth service
 * (https://auth.spacechild.love) alongside the existing wallet-based flow.
 *
 * - Proxies register/login/refresh to the upstream service
 *   (configurable via SPACECHILD_AUTH_URL)
 * - Verifies access tokens remotely via POST /auth/sso/verify
 *   (upstream JWTs are HS256 signed with a secret we do not hold)
 * - Maps the Space Child user (id/email) onto the app's wallet-keyed user
 *   model via a deterministic derived address, and mints the same app
 *   session JWT the rest of the API expects (see server/middleware/auth.ts)
 *
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createHash, randomUUID } from 'crypto';
import { z } from 'zod';

const router = Router();

// Read env directly (config.js is CommonJS and cannot be imported under
// "type": "module"; values are also mirrored there for documentation)
const SPACECHILD_AUTH_URL = process.env.SPACECHILD_AUTH_URL || 'https://auth.spacechild.love';
const JWT_SECRET = process.env.JWT_SECRET || '';

const UPSTREAM_TIMEOUT_MS = 10000;
const SESSION_TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

// ============================================================================
// Validation Schemas
// ============================================================================

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ============================================================================
// Upstream Client
// ============================================================================

interface SpaceChildUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface UpstreamResult {
  status: number;
  body: any;
}

function authBaseUrl(): string {
  return SPACECHILD_AUTH_URL.replace(/\/+$/, '');
}

async function callUpstream(path: string, init: RequestInit = {}): Promise<UpstreamResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(`${authBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================================
// Session Establishment
// ============================================================================

/**
 * Derive a deterministic wallet-shaped address from a Space Child user id so
 * federated users fit the app's wallet-keyed identity model
 * (shared/schema.ts requires ^0x[a-fA-F0-9]{40}$).
 */
export function deriveWalletAddress(spacechildUserId: string): string {
  return '0x' + createHash('sha256')
    .update(`spacechild:${spacechildUserId}`)
    .digest('hex')
    .slice(0, 40);
}

/**
 * Mint the app's own session JWT (same payload contract enforced by
 * middleware/auth.ts) so federated users can call protected endpoints.
 * Returns null when JWT_SECRET is not configured (dev fallback).
 */
function mintSessionToken(user: SpaceChildUser): string | null {
  if (!JWT_SECRET) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId: user.id,
    walletAddress: deriveWalletAddress(user.id),
    verificationLevel: 'basic' as const,
    sessionId: `spacechild-${randomUUID()}`,
    iat: now,
    exp: now + SESSION_TOKEN_TTL_SECONDS,
  };
  return jwt.sign(payload, JWT_SECRET);
}

function buildSessionResponse(user: SpaceChildUser, accessToken: string, refreshToken: string) {
  return {
    success: true,
    provider: 'spacechild',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
    },
    walletAddress: deriveWalletAddress(user.id),
    accessToken,
    refreshToken,
    sessionToken: mintSessionToken(user),
  };
}

// ============================================================================
// Routes (mounted at /api/auth/spacechild)
// ============================================================================

/**
 * POST /api/auth/spacechild/login
 * Proxy credentials to the Space Child auth service and establish a session
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { status, body } = await callUpstream('/auth/login', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });

    // MFA-protected accounts: surface the challenge to the client unchanged
    if (status === 200 && body.requiresMfa) {
      return res.json({
        requiresMfa: true,
        partialToken: body.partialToken,
        availableMethods: body.availableMethods,
        expiresAt: body.expiresAt,
      });
    }

    if (status !== 200 || !body.success || !body.accessToken) {
      return res.status(status === 200 ? 401 : status).json({
        error: body.error || 'Space Child login failed',
        requiresVerification: body.requiresVerification,
      });
    }

    res.json(buildSessionResponse(body.user, body.accessToken, body.refreshToken));
  } catch (error: any) {
    console.error('Space Child login error:', error);
    res.status(502).json({ error: 'Space Child auth service unavailable' });
  }
});

/**
 * POST /api/auth/spacechild/register
 * Proxy registration to the Space Child auth service
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { status, body } = await callUpstream('/auth/register', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });

    if (status !== 200 || !body.success) {
      return res.status(status === 200 ? 400 : status).json({
        error: body.error || 'Space Child registration failed',
      });
    }

    // Email verification required before tokens are issued
    if (body.requiresVerification && !body.accessToken) {
      return res.json({
        success: true,
        requiresVerification: true,
        message: body.message || 'Please verify your email before logging in.',
        user: body.user,
      });
    }

    res.json(buildSessionResponse(body.user, body.accessToken, body.refreshToken));
  } catch (error: any) {
    console.error('Space Child registration error:', error);
    res.status(502).json({ error: 'Space Child auth service unavailable' });
  }
});

/**
 * GET /api/auth/spacechild/user
 * Fetch the federated user profile using the Space Child access token
 */
router.get('/user', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const { status, body } = await callUpstream('/auth/user', {
      method: 'GET',
      headers: { Authorization: authHeader },
    });

    if (status !== 200) {
      return res.status(status).json({ error: body.error || body.message || 'Failed to get user' });
    }

    res.json({
      ...body,
      walletAddress: deriveWalletAddress(body.id),
      provider: 'spacechild',
    });
  } catch (error: any) {
    console.error('Space Child get user error:', error);
    res.status(502).json({ error: 'Space Child auth service unavailable' });
  }
});

/**
 * POST /api/auth/spacechild/refresh
 * Rotate upstream tokens and re-mint the app session token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { status, body } = await callUpstream('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: parsed.data.refreshToken }),
    });

    if (status !== 200 || !body.accessToken) {
      return res.status(status === 200 ? 401 : status).json({
        error: body.error || 'Token refresh failed',
      });
    }

    // Resolve user claims from the new access token via the SSO verify endpoint
    const verify = await callUpstream('/auth/sso/verify', {
      method: 'POST',
      body: JSON.stringify({ token: body.accessToken }),
    });

    if (verify.status !== 200 || !verify.body.valid) {
      return res.status(401).json({ error: 'Refreshed token failed verification' });
    }

    const user: SpaceChildUser = {
      id: verify.body.userId,
      email: verify.body.email,
      firstName: verify.body.firstName,
      lastName: verify.body.lastName,
    };

    res.json(buildSessionResponse(user, body.accessToken, body.refreshToken));
  } catch (error: any) {
    console.error('Space Child token refresh error:', error);
    res.status(502).json({ error: 'Space Child auth service unavailable' });
  }
});

export default router;
