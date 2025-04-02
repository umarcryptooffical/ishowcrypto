
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, VideoCategory } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, PinIcon, Play, ExternalLink, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import CategoryManager from "@/components/common/CategoryManager";

const Videos = () => {
  const { user, isAuthenticated } = useAuth();
  const { videos, addVideo, updateVideo, deleteVideo } = useData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<VideoCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Crypto Series' as VideoCategory,
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    isPinned: false,
    isPaid: false,
  });
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // Check if user can upload videos (UmarCryptospace user or demo)
  const canUploadVideos = user?.canUploadVideos || user?.isAdmin;

  // Get videos - all videos are public
  const filteredVideos = videos.filter(video => {
    const matchesTab = selectedTab === 'All' || video.category === selectedTab;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort videos: pinned first, then by creation date (newest first)
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const resetFormData = () => {
    setFormData({
      title: '',
      category: 'Crypto Series',
      description: '',
      thumbnailUrl: '',
      videoUrl: '',
      isPinned: false,
      isPaid: false,
    });
    setCurrentVideoId(null);
  };

  const handleCreate = () => {
    if (!canUploadVideos) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to upload videos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    resetFormData();
  };

  const handleEdit = (video: any) => {
    // Only allow editing if user owns the video or has admin permission
    if (video.userId !== user?.id && !user?.isAdmin) {
      toast({
        title: "Permission denied",
        description: "You can only edit your own videos.",
        variant: "destructive",
      });
      return;
    }
    
    setFormData({
      title: video.title,
      category: video.category,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      isPinned: video.isPinned,
      isPaid: video.isPaid || false,
    });
    setCurrentVideoId(video.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string, userId: string) => {
    // Only allow deletion if user owns the video or has admin permission
    if (userId !== user?.id && !user?.isAdmin) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own videos.",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this video?')) {
      deleteVideo(id);
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean, userId: string) => {
    // Only allow pinning if user owns the video or has admin permission
    if (userId !== user?.id && !user?.isAdmin) {
      toast({
        title: "Permission denied",
        description: "You can only pin your own videos.",
        variant: "destructive",
      });
      return;
    }
    
    updateVideo(id, { isPinned: !isPinned });
  };

  const handleFormSubmit = () => {
    if (!formData.title || !formData.category || !formData.videoUrl) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate URLs
    try {
      new URL(formData.videoUrl);
      if (formData.thumbnailUrl) {
        new URL(formData.thumbnailUrl);
      }
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter valid URLs starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    // Set default thumbnail if not provided
    if (!formData.thumbnailUrl) {
      // If YouTube video
      if (formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (formData.videoUrl.includes('v=')) {
          videoId = formData.videoUrl.split('v=')[1].split('&')[0];
        } else if (formData.videoUrl.includes('youtu.be/')) {
          videoId = formData.videoUrl.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
          formData.thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        } else {
          formData.thumbnailUrl = 'https://i.ytimg.com/vi/default/hqdefault.jpg';
        }
      } else {
        formData.thumbnailUrl = 'https://placehold.co/600x400/222/555?text=Crypto+Video';
      }
    }

    if (isEditing && currentVideoId) {
      updateVideo(currentVideoId, formData);
      setIsEditing(false);
    } else {
      addVideo(formData);
      setIsCreating(false);
    }
    
    resetFormData();
  };

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Crypto Videos</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          
          <div className="flex gap-2">
            {user?.isAdmin && <CategoryManager type="video" />}
            
            {isAuthenticated && (
              <Button onClick={handleCreate} disabled={!canUploadVideos}>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {isAuthenticated && !canUploadVideos && (
        <Alert className="mb-4 bg-card border-yellow-600/30">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            Only authorized users can upload videos. Contact the administrator for access.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="All" value={selectedTab} onValueChange={(value) => setSelectedTab(value as VideoCategory | 'All')}>
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          <TabsTrigger value="All">All</TabsTrigger>
          {['Crypto Series', 'Top Testnets', 'Mining Projects'].map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab}>
          {sortedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVideos.map(video => (
                <Card key={video.id} className={cn(
                  "border-border/40 transition-all hover:border-primary/30 overflow-hidden",
                  video.isPinned && "border-l-4 border-l-crypto-yellow",
                  video.isPaid && "border-t-4 border-t-crypto-green"
                )}>
                  <div className="relative aspect-video bg-muted/30">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/222/555?text=Crypto+Video';
                      }}
                    />
                    <a 
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-primary/90 rounded-full p-3">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </a>
                    {video.isPaid && (
                      <div className="absolute top-2 right-2 bg-crypto-green text-white text-xs font-bold px-2 py-1 rounded">
                        PAID
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="outline">{video.category}</Badge>
                      {isAuthenticated && (video.userId === user?.id || user?.isAdmin) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleTogglePin(video.id, video.isPinned, video.userId)}
                        >
                          <PinIcon className={cn("h-4 w-4", video.isPinned ? "text-crypto-yellow fill-crypto-yellow" : "")} />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                  </CardHeader>
                  
                  <CardFooter className="flex justify-between pt-0">
                    <a 
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 text-sm"
                    >
                      Watch Video
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    
                    {isAuthenticated && (video.userId === user?.id || user?.isAdmin) && (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(video)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(video.id, video.userId)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No videos found in this category.</p>
              {isAuthenticated && canUploadVideos && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Video Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Video" : "Add New Video"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details of your crypto video" 
                : "Share a new crypto video with the community"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Video title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as VideoCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['Crypto Series', 'Top Testnets', 'Mining Projects'].map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this video covers"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">YouTube links are recommended</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://example.com/thumbnail.jpg"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Leave empty to use default YouTube thumbnail</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
              <Label htmlFor="isPinned">Pin to top</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
              />
              <Label htmlFor="isPaid">Paid content</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              resetFormData();
            }}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit}>
              {isEditing ? "Update Video" : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Videos;
