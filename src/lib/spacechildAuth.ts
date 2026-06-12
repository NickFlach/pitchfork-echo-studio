// Space Child SSO federation client
// Talks to the local API (server/spacechild-auth.ts), which proxies the
// standalone Space Child auth service at https://auth.spacechild.love

// Match the API base resolution used in queryClient.ts
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001'
  : '';

// Local storage keys (follows the pitchfork_* convention in lib/api.ts)
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pitchfork_spacechild_access_token',
  REFRESH_TOKEN: 'pitchfork_spacechild_refresh_token',
  SESSION_TOKEN: 'pitchfork_spacechild_session_token',
  USER: 'pitchfork_spacechild_user',
};

export interface SpaceChildUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface SpaceChildSession {
  user: SpaceChildUser;
  walletAddress: string;
  accessToken: string;
  refreshToken: string;
  sessionToken?: string | null;
}

export interface SpaceChildAuthResult {
  session?: SpaceChildSession;
  requiresVerification?: boolean;
  requiresMfa?: boolean;
  message?: string;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return body;
}

// Persist the federated session and mirror it into the app's wallet-keyed
// identity store so the rest of the UI treats the user like any other identity
function storeSession(body: any): SpaceChildSession {
  const session: SpaceChildSession = {
    user: body.user,
    walletAddress: body.walletAddress,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    sessionToken: body.sessionToken ?? null,
  };

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
    ...session.user,
    walletAddress: session.walletAddress,
  }));
  if (session.sessionToken) {
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, session.sessionToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  }

  // Create the local identity record on first login (same shape as identityApi)
  const identityKey = `identity_${session.walletAddress}`;
  if (!localStorage.getItem(identityKey)) {
    localStorage.setItem(identityKey, JSON.stringify({
      id: session.walletAddress,
      walletAddress: session.walletAddress,
      verificationLevel: 'basic',
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        provider: 'spacechild',
        spacechildUserId: session.user.id,
        email: session.user.email,
      },
    }));
  }

  return session;
}

export function getStoredSession(): SpaceChildSession | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!accessToken || !refreshToken || !userRaw) return null;

  try {
    const stored = JSON.parse(userRaw);
    const { walletAddress, ...user } = stored;
    return {
      user,
      walletAddress,
      accessToken,
      refreshToken,
      sessionToken: localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN),
    };
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<SpaceChildAuthResult> {
  const body = await request('/api/auth/spacechild/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (body.requiresMfa) {
    return { requiresMfa: true, message: 'This account requires MFA, which is not supported here yet.' };
  }

  return { session: storeSession(body) };
}

export async function register(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<SpaceChildAuthResult> {
  const body = await request('/api/auth/spacechild/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  if (body.requiresVerification && !body.accessToken) {
    return { requiresVerification: true, message: body.message };
  }

  return { session: storeSession(body) };
}

export async function fetchUser(): Promise<SpaceChildUser & { walletAddress: string }> {
  const session = getStoredSession();
  if (!session) {
    throw new Error('Not signed in with Space Child');
  }

  return request('/api/auth/spacechild/user', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
}

export async function refreshSession(): Promise<SpaceChildSession> {
  const session = getStoredSession();
  if (!session) {
    throw new Error('Not signed in with Space Child');
  }

  const body = await request('/api/auth/spacechild/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  return storeSession(body);
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}
