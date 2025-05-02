import { Express, Request, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';

// Initialize the Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REPLIT_DOMAINS ? 
    `https://${process.env.REPLIT_DOMAINS}/api/spotify/callback` : 
    'http://localhost:5000/api/spotify/callback'
});

export function setupSpotifyRoutes(app: Express) {
  // Login to Spotify
  app.get('/api/spotify/login', (req: Request, res: Response) => {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-top-read'
    ];
    
    const state = 'fitness_app_state';
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.json({ url: authorizeURL });
  });

  // Handle Spotify callback
  app.get('/api/spotify/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    
    try {
      if (typeof code !== 'string') {
        throw new Error('Authorization code must be a string');
      }
      
      const data = await spotifyApi.authorizationCodeGrant(code);
      
      // Redirect to frontend with tokens in query parameters
      // Note: In a production app, you wouldn't pass tokens in URL (use cookies or session)
      const redirectUrl = '/workout-music?' + new URLSearchParams({
        access_token: data.body.access_token,
        refresh_token: data.body.refresh_token,
        expires_in: data.body.expires_in.toString()
      }).toString();
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Spotify callback:', error);
      res.redirect('/workout-music?error=spotify_auth_failed');
    }
  });

  // Get user profile
  app.get('/api/spotify/me', async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
      }
      
      spotifyApi.setAccessToken(accessToken);
      const userData = await spotifyApi.getMe();
      res.json(userData.body);
    } catch (error) {
      console.error('Error getting Spotify profile:', error);
      res.status(500).json({ error: 'Failed to get Spotify profile' });
    }
  });

  // Create a workout playlist
  app.post('/api/spotify/playlists', async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
      }
      
      spotifyApi.setAccessToken(accessToken);
      
      const { name, workoutType, intensity, duration, trackUris } = req.body;
      
      if (!name || !workoutType || !intensity || !duration || !trackUris) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Get user ID
      const userProfile = await spotifyApi.getMe();
      const userId = userProfile.body.id;
      
      // Create playlist
      const playlist = await spotifyApi.createPlaylist(userId, `${name} Workout`, {
        description: `${intensity} intensity ${workoutType} workout playlist`,
        public: false
      });
      
      // Add tracks to playlist
      if (trackUris.length > 0) {
        await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);
      }
      
      res.status(201).json(playlist.body);
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({ error: 'Failed to create playlist' });
    }
  });

  // Search for tracks
  app.get('/api/spotify/search', async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
      }
      
      spotifyApi.setAccessToken(accessToken);
      
      const { q, limit = '20' } = req.query;
      
      if (typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = await spotifyApi.searchTracks(q, {
        limit: parseInt(limit as string, 10)
      });
      
      res.json(results.body);
    } catch (error) {
      console.error('Error searching tracks:', error);
      res.status(500).json({ error: 'Failed to search tracks' });
    }
  });

  // Get recommendations based on workout type
  app.get('/api/spotify/recommendations', async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
      }
      
      spotifyApi.setAccessToken(accessToken);
      
      const { seed_genres, target_energy, limit = '20' } = req.query;
      
      if (typeof seed_genres !== 'string') {
        return res.status(400).json({ error: 'Seed genres are required' });
      }
      
      // Get recommendations
      const recommendations = await spotifyApi.getRecommendations({
        seed_genres: seed_genres.split(','),
        target_energy: target_energy ? parseFloat(target_energy as string) : 0.7,
        limit: parseInt(limit as string, 10)
      });
      
      res.json(recommendations.body);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  });
}