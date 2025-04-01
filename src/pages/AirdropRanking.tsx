import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { AirdropRanking as AirdropRankingType } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, PinIcon, Star, StarHalf, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AirdropRanking = () => {
  const { user } = useAuth();
  const { rankings, addRanking, updateRanking, deleteRanking } = useData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<AirdropRankingType>>({
    rank: 1,
    title: '',
    description: '',
    fundingAmount: '',
    rewards: '',
    rating: 5,
    detailsLink: '',
    isPinned: false,
  });
  const [currentRankingId, setCurrentRankingId] = useState<string | null>(null);

  const filteredRankings = rankings.filter(ranking => {
    return ranking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ranking.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.rank - b.rank;
  });

  const resetFormData = () => {
    setFormData({
      rank: rankings.length > 0 ? Math.max(...rankings.map(r => r.rank)) + 1 : 1,
      title: '',
      description: '',
      fundingAmount: '',
      rewards: '',
      rating: 5,
      detailsLink: '',
      isPinned: false,
    });
    setCurrentRankingId(null);
  };

  const handleCreate = () => {
    if (!user?.isAdmin) {
      return;
    }
    setIsCreating(true);
    resetFormData();
  };

  const handleEdit = (ranking: AirdropRankingType) => {
    if (!user?.isAdmin) {
      return;
    }
    setFormData({ ...ranking });
    setCurrentRankingId(ranking.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (!user?.isAdmin) {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this ranking?')) {
      deleteRanking(id);
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    if (!user?.isAdmin) {
      return;
    }
    
    updateRanking(id, { isPinned: !isPinned });
  };

  const handleFormSubmit = () => {
    if (!formData.title || formData.rank === undefined) {
      alert("Please fill in the title and rank.");
      return;
    }

    if (isEditing && currentRankingId) {
      updateRanking(currentRankingId, formData);
      setIsEditing(false);
    } else {
      addRanking(formData as Omit<AirdropRankingType, 'id' | 'createdAt'>);
      setIsCreating(false);
    }
    
    resetFormData();
  };

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} className="h-4 w-4 fill-crypto-yellow text-crypto-yellow" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half-star" className="h-4 w-4 fill-crypto-yellow text-crypto-yellow" />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      );
    }
    
    return <div className="flex">{stars}</div>;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Airdrop Rankings</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search rankings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          
          {user?.isAdmin && (
            <Button onClick={handleCreate} className="bg-crypto-green hover:bg-crypto-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Ranking
            </Button>
          )}
        </div>
      </div>

      {sortedRankings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Airdrop Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Funding</TableHead>
                  <TableHead>Rewards</TableHead>
                  <TableHead>Rating</TableHead>
                  {user?.isAdmin && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRankings.map((ranking) => (
                  <TableRow key={ranking.id} className={cn(
                    ranking.isPinned && "bg-crypto-green/5"
                  )}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {ranking.isPinned && <PinIcon className="h-3 w-3 text-crypto-yellow mr-1" />}
                        <span>{ranking.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ranking.title}</div>
                        <div className="text-sm text-muted-foreground">{ranking.description}</div>
                        {ranking.detailsLink && (
                          <a 
                            href={ranking.detailsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center mt-1 hover:underline"
                          >
                            View Details <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ranking.fundingAmount}</TableCell>
                    <TableCell>{ranking.rewards}</TableCell>
                    <TableCell>{renderRating(ranking.rating)}</TableCell>
                    {user?.isAdmin && (
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(ranking)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleTogglePin(ranking.id, ranking.isPinned)}
                          >
                            <PinIcon className={cn("h-3.5 w-3.5", ranking.isPinned && "text-crypto-yellow fill-crypto-yellow")} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(ranking.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No rankings found.</p>
          {user?.isAdmin && (
            <Button onClick={handleCreate} className="bg-crypto-green hover:bg-crypto-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Add First Ranking
            </Button>
          )}
        </div>
      )}

      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          resetFormData();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Ranking" : "Add New Ranking"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the ranking details" 
                : "Add a new project to the rankings"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rank" className="text-right">
                Rank
              </Label>
              <Input
                id="rank"
                type="number"
                min="1"
                className="col-span-3"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fundingAmount" className="text-right">
                Funding
              </Label>
              <Input
                id="fundingAmount"
                className="col-span-3"
                value={formData.fundingAmount}
                onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rewards" className="text-right">
                Rewards
              </Label>
              <Input
                id="rewards"
                className="col-span-3"
                value={formData.rewards}
                onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rating" className="text-right">
                Rating (1-5)
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rating: Math.min(5, Math.max(1, parseFloat(e.target.value) || 1)) 
                  })}
                />
                <div className="flex">
                  {renderRating(formData.rating || 5)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detailsLink" className="text-right">
                Details URL
              </Label>
              <Input
                id="detailsLink"
                className="col-span-3"
                placeholder="https://"
                value={formData.detailsLink}
                onChange={(e) => setFormData({ ...formData, detailsLink: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isPinned" className="text-right">
                Pin to top
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                />
                <Label htmlFor="isPinned">Pinned</Label>
              </div>
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
            <Button onClick={handleFormSubmit} className="bg-crypto-green hover:bg-crypto-green/90">
              {isEditing ? "Update Ranking" : "Add Ranking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AirdropRanking;
