import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Music, ExternalLink, Heart, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomNavbar } from "@/components/BottomNavbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  isSpotifyLoggedIn,
  getSpotifyAuthUrl,
  handleSpotifyCallback,
  getWorkoutPlaylists,
  searchWorkoutTracks,
} from "@/lib/spotify-service";
import { queryClient } from "@/lib/queryClient";
import { Workout } from "@/lib/fitness-types";

interface TrackType {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  uri: string;
}

interface PlaylistType {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
  };
  uri: string;
  external_urls: {
    spotify: string;
  };
}

export default function WorkoutMusic() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoggedIn, setIsLoggedIn] = useState(isSpotifyLoggedIn());
  const [activeTab, setActiveTab] = useState("discover");
  const [workoutType, setWorkoutType] = useState<string>("running");
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
  const [duration, setDuration] = useState<number>(30);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Process URL parameters for Spotify callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");
    
    if (error) {
      toast({
        title: "Spotify Login Failed",
        description: "There was an issue logging into Spotify. Please try again.",
        variant: "destructive"
      });
      // Clear the URL parameters
      navigate("/workout-music", { replace: true });
    } else if (code) {
      // Handle authorization code from server redirect
      handleSpotifyCallback(code)
        .then(() => {
          setIsLoggedIn(true);
          toast({
            title: "Spotify Connected",
            description: "Successfully connected to Spotify!",
          });
          navigate("/workout-music", { replace: true });
        })
        .catch(error => {
          console.error("Error handling Spotify callback:", error);
          toast({
            title: "Connection Failed",
            description: "There was an issue connecting to Spotify. Please try again.",
            variant: "destructive"
          });
          navigate("/workout-music", { replace: true });
        });
    }
  }, [location, navigate, toast]);
  
  // Get recent workouts to suggest playlists
  const { data: workouts } = useQuery({
    queryKey: ['/api/workouts'],
    enabled: isLoggedIn,
  });
  
  // Get user's Spotify playlists
  const { data: spotifyPlaylists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['/api/spotify/playlists'],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      try {
        return await getWorkoutPlaylists();
      } catch (error) {
        console.error("Error fetching playlists:", error);
        return [];
      }
    },
    enabled: isLoggedIn,
  });
  
  // Search for tracks based on workout type and intensity
  const { data: recommendedTracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['/api/spotify/tracks', workoutType, intensity, duration],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      try {
        return await searchWorkoutTracks(workoutType, intensity, duration);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        return [];
      }
    },
    enabled: isLoggedIn,
  });
  
  // Search for tracks by query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/spotify/search', searchQuery],
    queryFn: async () => {
      if (!isLoggedIn || !searchQuery.trim()) return [];
      
      try {
        const accessToken = localStorage.getItem('spotify_access_token');
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=20`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = await response.json();
        return data.tracks?.items || [];
      } catch (error) {
        console.error("Error searching tracks:", error);
        return [];
      }
    },
    enabled: isLoggedIn && searchQuery.trim().length > 0,
  });
  
  // Create a playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        throw new Error('Not logged in to Spotify');
      }
      
      if (!playlistName.trim()) {
        throw new Error('Please enter a playlist name');
      }
      
      if (selectedTrackIds.length === 0) {
        throw new Error('Please select at least one track');
      }
      
      // Get track URIs for selected tracks
      const trackUris = selectedTrackIds.map(id => {
        const track = [...(recommendedTracks || []), ...(searchResults || [])].find((t: any) => t.id === id);
        return track?.uri;
      }).filter(Boolean) as string[];
      
      try {
        const accessToken = localStorage.getItem('spotify_access_token');
        const response = await fetch('/api/spotify/playlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            name: playlistName,
            workoutType,
            intensity,
            duration,
            trackUris
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create playlist');
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error creating playlist:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Playlist Created",
        description: "Your workout playlist has been created successfully!"
      });
      
      // Reset form
      setPlaylistName("");
      setSelectedTrackIds([]);
      
      // Invalidate playlists cache
      queryClient.invalidateQueries({ queryKey: ['/api/spotify/playlists'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Playlist Creation Failed",
        description: error.message || "Failed to create playlist. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle Spotify login
  const handleSpotifyLogin = async () => {
    try {
      // Get the auth URL from the server instead
      const response = await fetch(getSpotifyAuthUrl());
      const data = await response.json();
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid authorization URL');
      }
    } catch (error) {
      console.error('Error getting Spotify auth URL:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to Spotify. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle Spotify logout
  const handleSpotifyLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    setIsLoggedIn(false);
    
    toast({
      title: "Logged Out",
      description: "You've been logged out of Spotify."
    });
  };
  
  // Create workout suggestions from recent workouts
  const workoutSuggestions = workouts 
    ? (workouts as Workout[]).slice(0, 3).map(workout => ({
        name: workout.name,
        type: (workout.workoutTypeId || 1).toString(),
        intensity: workout.intensity || "medium",
        duration: workout.duration || 30
      }))
    : [];
  
  // Format track duration from milliseconds to MM:SS
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Toggle track selection
  const toggleTrackSelection = (trackId: string) => {
    if (selectedTrackIds.includes(trackId)) {
      setSelectedTrackIds(selectedTrackIds.filter(id => id !== trackId));
    } else {
      setSelectedTrackIds([...selectedTrackIds, trackId]);
    }
  };
  
  // Render track item
  const renderTrackItem = (track: TrackType) => (
    <div 
      key={track.id} 
      className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${
        selectedTrackIds.includes(track.id) ? 'bg-primary/20' : 'bg-card hover:bg-card/80'
      }`}
      onClick={() => toggleTrackSelection(track.id)}
    >
      <div className="relative w-12 h-12 mr-3 flex-shrink-0">
        <img 
          src={track.album.images[0]?.url || '/default-album.jpg'} 
          alt={track.album.name}
          className="w-full h-full object-cover rounded-md"
        />
        {selectedTrackIds.includes(track.id) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
            <Heart className="h-6 w-6 text-primary fill-primary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white truncate">{track.name}</h3>
        <p className="text-xs text-gray-400 truncate">
          {track.artists.map(artist => artist.name).join(", ")}
        </p>
      </div>
      <div className="text-xs text-gray-400 ml-2">
        {formatDuration(track.duration_ms)}
      </div>
    </div>
  );
  
  // Render playlist item
  const renderPlaylistItem = (playlist: PlaylistType) => (
    <div key={playlist.id} className="flex p-3 rounded-lg mb-2 bg-card">
      <div className="w-16 h-16 mr-3 flex-shrink-0">
        <img 
          src={playlist.images[0]?.url || '/default-playlist.jpg'} 
          alt={playlist.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white">{playlist.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-2">{playlist.description}</p>
        <p className="text-xs text-gray-400 mt-1">{playlist.tracks.total} tracks</p>
      </div>
      <a 
        href={playlist.external_urls.spotify} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-2 text-primary hover:text-primary/80"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="h-5 w-5" />
      </a>
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <ChevronLeft className="h-6 w-6 mr-2 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Workout Music</h1>
          </div>
          
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={handleSpotifyLogout}>
              Disconnect Spotify
            </Button>
          ) : (
            <Button 
              onClick={handleSpotifyLogin} 
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              Connect Spotify
            </Button>
          )}
        </div>
      </div>
      
      {!isLoggedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <div className="bg-card rounded-xl p-6 text-center max-w-md">
            <Music className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold text-white mb-2">Connect to Spotify</h2>
            <p className="text-gray-400 mb-6">
              Connect your Spotify account to create personalized workout playlists based on your workouts.
            </p>
            <Button 
              onClick={handleSpotifyLogin} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Connect Spotify
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-gray-800 mx-5 w-auto overflow-x-auto flex p-1 space-x-1">
              <TabsTrigger value="discover" className="flex-1 text-sm">Discover</TabsTrigger>
              <TabsTrigger value="create" className="flex-1 text-sm">Create Playlist</TabsTrigger>
              <TabsTrigger value="playlists" className="flex-1 text-sm">My Playlists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discover" className="px-5 py-4 flex-1">
              <div className="bg-card rounded-xl p-5 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Find Music for Your Workout</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Workout Type</label>
                    <Select value={workoutType} onValueChange={setWorkoutType}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="cycling">Cycling</SelectItem>
                        <SelectItem value="walking">Walking</SelectItem>
                        <SelectItem value="hiit">HIIT</SelectItem>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="dancing">Dancing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Intensity</label>
                    <Select value={intensity} onValueChange={(value) => setIntensity(value as "low" | "medium" | "high")}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Intensity</SelectItem>
                        <SelectItem value="medium">Medium Intensity</SelectItem>
                        <SelectItem value="high">High Intensity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Duration (minutes)</label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {workoutSuggestions.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-3">Based on Your Recent Workouts</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {workoutSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-card rounded-xl p-4">
                        <h3 className="text-white font-medium mb-1">{suggestion.name}</h3>
                        <p className="text-xs text-gray-400 mb-3">
                          {suggestion.intensity.charAt(0).toUpperCase() + suggestion.intensity.slice(1)} intensity • {suggestion.duration} min
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setWorkoutType(suggestion.type.toLowerCase());
                            setIntensity(suggestion.intensity as "low" | "medium" | "high");
                            setDuration(suggestion.duration);
                          }}
                        >
                          Find Music
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-white">Recommended Tracks</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setActiveTab("create");
                      // Pre-select some tracks
                      if (recommendedTracks && recommendedTracks.length > 0) {
                        setSelectedTrackIds(recommendedTracks.slice(0, 5).map((track: any) => track.id));
                        setPlaylistName(`${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} - ${intensity.charAt(0).toUpperCase() + intensity.slice(1)} Intensity`);
                      }
                    }}
                    disabled={!recommendedTracks || recommendedTracks.length === 0}
                  >
                    Create Playlist
                  </Button>
                </div>
                
                {tracksLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : recommendedTracks && recommendedTracks.length > 0 ? (
                  <div className="space-y-2">
                    {recommendedTracks.map((track: any) => renderTrackItem(track as TrackType))}
                  </div>
                ) : (
                  <div className="bg-card/30 rounded-xl p-6 text-center">
                    <p className="text-gray-400">No tracks found for the selected criteria</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="px-5 py-4 flex-1">
              <div className="bg-card rounded-xl p-5 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Create a Playlist</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Playlist Name</label>
                    <Input
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Enter playlist name"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-primary"
                    onClick={() => createPlaylistMutation.mutate()}
                    disabled={createPlaylistMutation.isPending || !playlistName || selectedTrackIds.length === 0}
                  >
                    {createPlaylistMutation.isPending ? (
                      <span className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Creating...
                      </span>
                    ) : "Create Playlist"}
                  </Button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-white">Selected Tracks ({selectedTrackIds.length})</h2>
                  {selectedTrackIds.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedTrackIds([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {selectedTrackIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTrackIds.map(id => {
                      const track = [...(recommendedTracks || []), ...(searchResults || [])].find((t: any) => t.id === id);
                      if (track) {
                        return renderTrackItem(track as TrackType);
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <div className="bg-card/30 rounded-xl p-6 text-center">
                    <p className="text-gray-400">No tracks selected. Search or discover tracks to add to your playlist.</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="mb-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for tracks..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <h2 className="text-lg font-bold text-white mb-3">Search Results</h2>
                
                {searchLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((track: any) => renderTrackItem(track as TrackType))}
                  </div>
                ) : searchQuery ? (
                  <div className="bg-card/30 rounded-xl p-6 text-center">
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="bg-card/30 rounded-xl p-6 text-center">
                    <p className="text-gray-400">Search for your favorite tracks to add to your playlist</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="playlists" className="px-5 py-4 flex-1">
              <h2 className="text-lg font-bold text-white mb-3">Your Workout Playlists</h2>
              
              {playlistsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : spotifyPlaylists && spotifyPlaylists.length > 0 ? (
                <div className="space-y-2">
                  {spotifyPlaylists.map((playlist: any) => renderPlaylistItem(playlist as PlaylistType))}
                </div>
              ) : (
                <div className="bg-card/30 rounded-xl p-6 text-center">
                  <p className="text-gray-400 mb-2">No workout playlists found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("create")}
                  >
                    Create a Playlist
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNavbar onAddClick={() => {}} />
    </div>
  );
}