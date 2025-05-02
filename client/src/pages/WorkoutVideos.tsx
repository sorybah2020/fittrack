import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNavbar } from "@/components/BottomNavbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkoutVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
  category: string;
}

// Sample workout videos from Chloe Ting's channel
const workoutVideos: WorkoutVideo[] = [
  {
    id: "2L2lnxIcNmo",
    title: "15 MIN FULL BODY WORKOUT - No Equipment | Intense",
    thumbnail: "https://i.ytimg.com/vi/2L2lnxIcNmo/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "15 min",
    category: "full-body"
  },
  {
    id: "3Pr6n-nKfMA",
    title: "15 MIN SIX PACK ABS WORKOUT - No Equipment",
    thumbnail: "https://i.ytimg.com/vi/3Pr6n-nKfMA/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "15 min",
    category: "abs"
  },
  {
    id: "UBMk30rjy0o",
    title: "20 MIN FULL BODY WORKOUT // No Equipment | Pamela Reif",
    thumbnail: "https://i.ytimg.com/vi/UBMk30rjy0o/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "20 min",
    category: "full-body"
  },
  {
    id: "mmq5zn_2yqA",
    title: "10 MIN MORNING ROUTINE - Stretch & Tone",
    thumbnail: "https://i.ytimg.com/vi/mmq5zn_2yqA/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "10 min",
    category: "stretching"
  },
  {
    id: "EI9YG1Huq88",
    title: "10 MIN TONED ARMS WORKOUT - No Equipment",
    thumbnail: "https://i.ytimg.com/vi/EI9YG1Huq88/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "10 min",
    category: "arms"
  },
  {
    id: "hI-JSz2Iv-k",
    title: "15 MIN UPPER BODY WORKOUT - No Equipment",
    thumbnail: "https://i.ytimg.com/vi/hI-JSz2Iv-k/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "15 min",
    category: "upper-body"
  },
  {
    id: "2MoGxae-zyo",
    title: "12 MIN HAPPY DANCE WORKOUT - Aerobic & Anaerobic",
    thumbnail: "https://i.ytimg.com/vi/2MoGxae-zyo/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "12 min",
    category: "cardio"
  },
  {
    id: "nShmwXiTkFI",
    title: "20 MIN WORKOUT FOR LEAN LEGS & ROUND BOOTY",
    thumbnail: "https://i.ytimg.com/vi/nShmwXiTkFI/hqdefault.jpg",
    channelTitle: "Chloe Ting",
    duration: "20 min",
    category: "legs"
  }
];

export default function WorkoutVideos() {
  const [selectedVideo, setSelectedVideo] = useState<WorkoutVideo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredVideos = workoutVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "all" || video.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <ChevronLeft className="h-6 w-6 mr-2 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Workout Videos</h1>
          </div>
        </div>
        
        <Input
          placeholder="Search workout videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
        />
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 w-full overflow-x-auto flex p-1 space-x-1">
            <TabsTrigger value="all" className="flex-1 text-sm rounded-md">All</TabsTrigger>
            <TabsTrigger value="full-body" className="flex-1 text-sm rounded-md">Full Body</TabsTrigger>
            <TabsTrigger value="abs" className="flex-1 text-sm rounded-md">Abs</TabsTrigger>
            <TabsTrigger value="arms" className="flex-1 text-sm rounded-md">Arms</TabsTrigger>
            <TabsTrigger value="legs" className="flex-1 text-sm rounded-md">Legs</TabsTrigger>
            <TabsTrigger value="cardio" className="flex-1 text-sm rounded-md">Cardio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Video Player */}
      {selectedVideo && (
        <div className="px-5 mb-4">
          <div className="rounded-xl overflow-hidden bg-black">
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-xl"
              ></iframe>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-1">{selectedVideo.title}</h3>
              <p className="text-sm text-gray-400">{selectedVideo.channelTitle} • {selectedVideo.duration}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Grid */}
      <div className="px-5 py-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium py-1 px-2 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white line-clamp-2">{video.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{video.channelTitle}</p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredVideos.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400">No videos found matching your search.</p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <a 
            href="https://www.youtube.com/@ChloeTing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-sm font-medium"
          >
            View more on Chloe Ting's YouTube Channel →
          </a>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar onAddClick={() => {}} />
    </div>
  );
}