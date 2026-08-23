import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

const client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

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

  // 2. Try verifying as Google ID Token (standard for @react-oauth/google <GoogleLogin />)
  try {
    const ticket = await client.verifyIdToken({
      idToken: credentialOrToken,
      audience: GOOGLE_CLIENT_ID ? [GOOGLE_CLIENT_ID] : undefined,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      const error: any = new Error('Invalid Google token: email not found in token payload');
      error.statusCode = 401;
      error.code = 'INVALID_GOOGLE_TOKEN';
      throw error;
    }

    return {
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (idTokenError: any) {
    // 3. Fallback: Check if it's an OAuth2 Authorization Code
    if (GOOGLE_CLIENT_SECRET && credentialOrToken.length > 20) {
      try {
        const { tokens } = await client.getToken(credentialOrToken);
        if (tokens.id_token) {
          const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID ? [GOOGLE_CLIENT_ID] : undefined,
          });
          const payload = ticket.getPayload();
          if (payload?.email) {
            return {
              email: payload.email.toLowerCase(),
              name: payload.name || payload.email.split('@')[0],
              picture: payload.picture,
              sub: payload.sub,
            };
          }
        }
      } catch (codeError: any) {
        // Fall through to error handler below
      }
    }

    const error: any = new Error(
      `Verifikasi token Google gagal: ${idTokenError.message}`
    );
    error.statusCode = 401;
    error.code = 'INVALID_GOOGLE_TOKEN';
    throw error;
  }
};
