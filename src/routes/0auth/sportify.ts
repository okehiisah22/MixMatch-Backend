import { Request, Response } from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IUser, UserRole } from '../../models/user.model';

dotenv.config();

const client = new AuthorizationCode({
  client: {
    id: process.env.SPOTIFY_CLIENT_ID as string,
    secret: process.env.SPOTIFY_CLIENT_SECRET as string,
  },
  auth: {
    tokenHost: 'https://accounts.spotify.com',
    authorizePath: '/authorize',
    tokenPath: '/api/token',
  },
});

const authorizationUri = client.authorizeURL({
  redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
  scope: 'user-read-email user-top-read',
  state: 'random_csrf_token', // improve later for CSRF security
});

// Redirect user to Spotify login
export const loginSpotify = (req: Request, res: Response): void => {
  res.redirect(authorizationUri);
};

// Handle Spotify callback
export const callbackSpotify = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  try {
    const tokenParams = {
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
      scope: 'user-read-email user-top-read',
    };

    const accessToken = await client.getToken(tokenParams);

    // Fetch User Profile
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken.token.access_token}`,
      },
    });

    // Fetch Top Artists
    const topArtistsRes = await axios.get(
      'https://api.spotify.com/v1/me/top/artists',
      {
        headers: {
          Authorization: `Bearer ${accessToken.token.access_token}`,
        },
      }
    );

    const topArtists = topArtistsRes.data;
    const topGenres: string[] = Array.from(
      new Set(topArtistsRes.data.items.flatMap((artist: any) => artist.genres))
    );

    const userData: Partial<IUser> = {
      socialLogin: profileRes.data.id,
      name: profileRes.data.display_name,
      email: profileRes.data.email,
      firstName: '', // Provide default or extracted value
      lastName: '', // Provide default or extracted value
      password: '', // Provide default or hashed value
      role: UserRole.DJ, // Provide default role
      refreshToken: JSON.stringify(accessToken.token.refresh_token),
      topArtists: topArtists,
      topGenres: topGenres,
      // Add other required properties with default or extracted values
    };

    // Issue JWT
    const token = jwt.sign(
      { id: userData.spotifyId, email: userData.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Send JWT and user data to frontend
    res.json({ token, user: userData });
  } catch (error: any) {
    console.error('Spotify callback error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
