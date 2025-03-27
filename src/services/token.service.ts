// This file would handle token operations including blacklisting

// In-memory blacklist (not suitable for production)
const tokenBlacklist = new Map<string, number>();

// Periodic cleanup of expired tokens
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry <= now) {
      tokenBlacklist.delete(token);
    }
  }
}, 60000); // Clean up every minute

/**
 * Adds a token to the blacklist with an expiry time
 * @param token JWT token to blacklist
 */
export const addToBlacklist = async (token: string): Promise<void> => {
  // Extract the expiry from the token payload
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  const expiryTimestamp = payload.exp;
  
  if (expiryTimestamp > Math.floor(Date.now() / 1000)) {
    // Store the token in the blacklist with its expiry time
    tokenBlacklist.set(token, expiryTimestamp);
  }
};

/**
 * Checks if a token is blacklisted
 * @param token JWT token to check
 * @returns boolean indicating if the token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  return tokenBlacklist.has(token);
}; 