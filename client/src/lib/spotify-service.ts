import SpotifyWebApi from 'spotify-web-api-node';
import { queryClient } from './queryClient';

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/api/spotify/callback`,
});

// Playlist categories based on workout types
export const WORKOUT_PLAYLIST_CATEGORIES = {
  running: "workout,running,cardio",
  cycling: "cycling,cardio,electronic",
  walking: "walking,calm,acoustic",
  hiit: "hiit,workout,electronic",
  strength: "strength,workout,hiphop",
  yoga: "yoga,meditation,ambient",
  dancing: "dance,electronic,pop"
};

// Define workout intensity levels and corresponding energy levels for Spotify
export const WORKOUT_INTENSITY_ENERGY = {
  low: { min: 0.2, max: 0.5, target: 0.4 },
  medium: { min: 0.5, max: 0.8, target: 0.65 },
  high: { min: 0.8, max: 1.0, target: 0.9 }
};

// Define workout duration to track length mappings
export const WORKOUT_DURATION_TRACKS = {
  10: 3, // 10 min workout = ~3 tracks
  15: 5, // 15 min workout = ~5 tracks
  20: 7, // 20 min workout = ~7 tracks
  30: 10, // 30 min workout = ~10 tracks
  45: 15, // 45 min workout = ~15 tracks
  60: 20, // 60 min workout = ~20 tracks
  90: 30, // 90 min workout = ~30 tracks
};

// Set access token if it exists in storage
const storedToken = localStorage.getItem('spotify_access_token');
if (storedToken) {
  spotifyApi.setAccessToken(storedToken);
}

// Check if user is logged in to Spotify
export const isSpotifyLoggedIn = (): boolean => {
  return !!localStorage.getItem('spotify_access_token');
};

// Get authentication URL for Spotify login
export const getSpotifyAuthUrl = (): string => {
  // Instead of using the client-side spotifyApi.createAuthorizeURL, we'll use the server endpoint
  return `/api/spotify/login`;
};

// Handle the Spotify authentication callback
export const handleSpotifyCallback = async (code: string): Promise<void> => {
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    // Save the access token
    localStorage.setItem('spotify_access_token', data.body.access_token);
    localStorage.setItem('spotify_refresh_token', data.body.refresh_token);
    localStorage.setItem('spotify_token_expiry', (Date.now() + data.body.expires_in * 1000).toString());
    
    // Set the access token on the API object
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);
    
    // Invalidate any cached Spotify data
    queryClient.invalidateQueries({ queryKey: ['/api/spotify'] });
  } catch (error) {
    console.error('Spotify auth error:', error);
    throw error;
  }
};

// Refresh the access token if expired
export const refreshSpotifyTokenIfNeeded = async (): Promise<void> => {
  const expiryStr = localStorage.getItem('spotify_token_expiry');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!expiryStr || !refreshToken) {
    return;
  }
  
  const expiry = parseInt(expiryStr, 10);
  
  // If token expires in less than 5 minutes, refresh it
  if (Date.now() + 300000 > expiry) {
    try {
      spotifyApi.setRefreshToken(refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      
      localStorage.setItem('spotify_access_token', data.body.access_token);
      localStorage.setItem('spotify_token_expiry', (Date.now() + data.body.expires_in * 1000).toString());
      
      spotifyApi.setAccessToken(data.body.access_token);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, clear tokens and redirect to login
      logoutSpotify();
    }
  }
};

// Logout from Spotify
export const logoutSpotify = (): void => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  spotifyApi.resetAccessToken();
  spotifyApi.resetRefreshToken();
};

// Get current user's Spotify profile
export const getSpotifyUserProfile = async () => {
  await refreshSpotifyTokenIfNeeded();
  return spotifyApi.getMe();
};

// Search for tracks based on workout type and intensity
export const searchWorkoutTracks = async (
  workoutType: string,
  intensity: 'low' | 'medium' | 'high',
  duration: number
) => {
  await refreshSpotifyTokenIfNeeded();
  
  // Map workout type to search query
  const searchCategory = WORKOUT_PLAYLIST_CATEGORIES[workoutType as keyof typeof WORKOUT_PLAYLIST_CATEGORIES] || 'workout';
  
  // Map intensity to energy range
  const energyRange = WORKOUT_INTENSITY_ENERGY[intensity];
  
  // Determine number of tracks based on duration
  const closestDuration = Object.keys(WORKOUT_DURATION_TRACKS)
    .map(Number)
    .reduce((prev, curr) => Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev);
    
  const trackCount = WORKOUT_DURATION_TRACKS[closestDuration as keyof typeof WORKOUT_DURATION_TRACKS] || 10;
  
  try {
    const result = await spotifyApi.searchTracks(`genre:${searchCategory}`, {
      limit: trackCount,
      market: 'US',
      min_energy: energyRange.min.toString(),
      max_energy: energyRange.max.toString(),
      target_energy: energyRange.target.toString()
    });
    
    return result.body.tracks?.items || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

// Create a workout playlist
export const createWorkoutPlaylist = async (
  workoutName: string,
  workoutType: string,
  intensity: 'low' | 'medium' | 'high',
  duration: number
) => {
  await refreshSpotifyTokenIfNeeded();
  
  try {
    // Get user profile to get user ID
    const userProfile = await spotifyApi.getMe();
    const userId = userProfile.body.id;
    
    // Create a new playlist
    const playlistResponse = await spotifyApi.createPlaylist(userId, `${workoutName} Workout`, {
      description: `${intensity} intensity ${workoutType} workout playlist`,
      public: false
    });
    
    const playlistId = playlistResponse.body.id;
    
    // Search for tracks
    const tracks = await searchWorkoutTracks(workoutType, intensity, duration);
    const trackUris = tracks.map(track => track.uri);
    
    // Add tracks to playlist
    if (trackUris.length > 0) {
      await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    }
    
    return playlistResponse.body;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// Get user's workout playlists
export const getWorkoutPlaylists = async () => {
  await refreshSpotifyTokenIfNeeded();
  
  try {
    const playlists = await spotifyApi.getUserPlaylists();
    return playlists.body.items.filter(playlist => 
      playlist.name.toLowerCase().includes('workout') || 
      playlist.description?.toLowerCase().includes('workout')
    );
  } catch (error) {
    console.error('Error getting playlists:', error);
    throw error;
  }
};

export default spotifyApi;