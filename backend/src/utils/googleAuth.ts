import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export const verifyGoogleCredential = async (
  credentialOrToken: string
): Promise<GoogleProfile> => {
  // 1. Dev / test mock support (e.g., "dev-mock:email@domain.com")
  if (
    process.env.NODE_ENV !== 'production' &&
    credentialOrToken.startsWith('dev-mock:')
  ) {
    const mockEmail = credentialOrToken.replace('dev-mock:', '').trim();
    return {
      email: mockEmail.toLowerCase(),
      name: mockEmail.split('@')[0].toUpperCase(),
      sub: `mock-sub-${mockEmail}`,
    };
  }

  // 2. Real Google OAuth ID Token verification
  try {
    const ticket = await client.verifyIdToken({
      idToken: credentialOrToken,
      audience: GOOGLE_CLIENT_ID ? [GOOGLE_CLIENT_ID] : undefined,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token: email not found in payload');
    }

    return {
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error: any) {
    // If not matching ID token format and client ID is mock, provide informative error
    if (process.env.NODE_ENV !== 'production' && GOOGLE_CLIENT_ID === 'mock-client-id-for-dev') {
      throw new Error(
        `Google token verification failed: ${error.message}. (In dev mode, you can pass 'dev-mock:your-email' to test whitelisted emails)`
      );
    }
    throw new Error(`Google token verification failed: ${error.message}`);
  }
};
