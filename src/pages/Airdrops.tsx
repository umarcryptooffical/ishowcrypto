
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, AirdropCategory, Airdrop, AirdropLink } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Link as LinkIcon, PinIcon, CheckCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories: AirdropCategory[] = [
  'Layer 1 & Testnet Mainnet',
  'Telegram Bot Airdrops',
  'Daily Check-in Airdrops',
  'Twitter Airdrops',
  'Social Airdrops',
  'AI Airdrops',
  'Wallet Airdrops',
  'Exchange Airdrops',
];

const Airdrops = () => {
  const { user } = useAuth();
  const { airdrops, addAirdrop, updateAirdrop, deleteAirdrop } = useData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<AirdropCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [linksBatch, setLinksBatch] = useState('');
  const [showBatchLinkInput, setShowBatchLinkInput] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Airdrop>>({
    title: '',
    category: 'Layer 1 & Testnet Mainnet',
    description: '',
    links: [],
    fundingAmount: '',
    rewards: '',
    timeCommitment: '',
    workRequired: '',
    isCompleted: false,
    isPinned: false,
  });
  const [currentAirdropId, setCurrentAirdropId] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Get user's airdrops + demo airdrops
  const userAirdrops = airdrops.filter(airdrop => 
    airdrop.userId === user?.id || airdrop.userId === 'demo'
  );

  // Filter airdrops based on selected tab and search
  const filteredAirdrops = userAirdrops.filter(airdrop => {
    const matchesTab = selectedTab === 'All' || airdrop.category === selectedTab;
    const matchesSearch = airdrop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airdrop.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort airdrops: pinned first, then by creation date (newest first)
  const sortedAirdrops = [...filteredAirdrops].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const resetFormData = () => {
    setFormData({
      title: '',
      category: 'Layer 1 & Testnet Mainnet',
      description: '',
      links: [],
      fundingAmount: '',
      rewards: '',
      timeCommitment: '',
      workRequired: '',
      isCompleted: false,
      isPinned: false,
    });
    setNewLinkName('');
    setNewLinkUrl('');
    setCurrentAirdropId(null);
    setLinksBatch('');
    setShowBatchLinkInput(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetFormData();
  };

  const handleEdit = (airdrop: Airdrop) => {
    setFormData({ ...airdrop });
    setCurrentAirdropId(airdrop.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this airdrop?')) {
      deleteAirdrop(id);
      toast({
        title: "Airdrop deleted",
        description: "The airdrop has been successfully deleted."
      });
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    updateAirdrop(id, { isPinned: !isPinned });
    toast({
      title: isPinned ? "Airdrop unpinned" : "Airdrop pinned",
      description: isPinned ? "The airdrop has been unpinned." : "The airdrop has been pinned to the top."
    });
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    updateAirdrop(id, { isCompleted: !isCompleted });
    toast({
      title: isCompleted ? "Airdrop marked as active" : "Airdrop marked as completed",
      description: isCompleted ? "The airdrop is now active." : "The airdrop has been marked as completed."
    });
  };

  const handleFormSubmit = () => {
    if (!formData.title || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title and category.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && currentAirdropId) {
      updateAirdrop(currentAirdropId, formData);
      toast({
        title: "Airdrop updated",
        description: "The airdrop has been successfully updated."
      });
      setIsEditing(false);
    } else {
      addAirdrop(formData as Omit<Airdrop, 'id' | 'userId' | 'createdAt'>);
      toast({
        title: "Airdrop added",
        description: "The new airdrop has been successfully added."
      });
      setIsCreating(false);
    }
    
    resetFormData();
  };

  const handleAddLink = () => {
    if (!newLinkName || !newLinkUrl) {
      toast({
        title: "Missing link information",
        description: "Please provide both name and URL for the link.",
        variant: "destructive",
      });
      return;
    }

    if (formData.links && formData.links.length >= 100) {
      toast({
        title: "Maximum links reached",
        description: "You can add up to 100 links per airdrop.",
        variant: "destructive",
      });
      return;
    }

    // Add the new link to the form data
    const newLink: AirdropLink = {
      id: Date.now().toString(),
      name: newLinkName,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
    };

    setFormData(prev => ({
      ...prev,
      links: [...(prev.links || []), newLink],
    }));

    // Reset link form fields
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (linkId: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links?.filter(link => link.id !== linkId) || [],
    }));
  };

  const processBatchLinks = () => {
    if (!linksBatch.trim()) {
      toast({
        title: "No links provided",
        description: "Please enter links to add in batch.",
        variant: "destructive",
      });
      return;
    }

    const currentLinksCount = formData.links?.length || 0;
    const lines = linksBatch.trim().split('\n').filter(line => line.trim());
    
    if (currentLinksCount + lines.length > 100) {
      toast({
        title: "Too many links",
        description: `You can add ${100 - currentLinksCount} more links (trying to add ${lines.length}).`,
        variant: "destructive",
      });
      return;
    }

    const newLinks: AirdropLink[] = [];
    
    // Process each line
    lines.forEach((line, index) => {
      const parts = line.split('|');
      let name, url;
      
      if (parts.length >= 2) {
        // Format: Name | URL
        name = parts[0].trim();
        url = parts[1].trim();
      } else {
        // Just URL, use generic name
        name = `Link ${currentLinksCount + index + 1}`;
        url = line.trim();
      }
      
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      
      newLinks.push({
        id: `batch-${Date.now()}-${index}`,
        name,
        url
      });
    });
    
    // Add all new links
    setFormData(prev => ({
      ...prev,
      links: [...(prev.links || []), ...newLinks],
    }));
    
    // Clear batch input
    setLinksBatch('');
    setShowBatchLinkInput(false);
    
    toast({
      title: "Links added",
      description: `Successfully added ${newLinks.length} links.`
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Airdrops</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search airdrops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          
          <Button onClick={handleCreate} className="bg-crypto-green hover:bg-crypto-green/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Airdrop
          </Button>
        </div>
      </div>

      <Tabs defaultValue="All" value={selectedTab} onValueChange={(value) => setSelectedTab(value as AirdropCategory | 'All')}>
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          <TabsTrigger value="All">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab}>
          {sortedAirdrops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAirdrops.map(airdrop => (
                <Card key={airdrop.id} className={cn(
                  "border-border/40 transition-all hover:border-primary/30",
                  airdrop.isPinned && "border-l-4 border-l-crypto-yellow"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="outline">{airdrop.category}</Badge>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleTogglePin(airdrop.id, airdrop.isPinned)}
                        >
                          <PinIcon className={cn("h-4 w-4", airdrop.isPinned ? "text-crypto-yellow fill-crypto-yellow" : "")} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleToggleComplete(airdrop.id, airdrop.isCompleted)}
                        >
                          <CheckCircle className={cn("h-4 w-4", airdrop.isCompleted ? "text-crypto-green fill-crypto-green" : "")} />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{airdrop.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{airdrop.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Funding</p>
                          <p className="font-medium">{airdrop.fundingAmount || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rewards</p>
                          <p className="font-medium">{airdrop.rewards || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">{airdrop.timeCommitment || "Varies"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className={cn(
                            "font-medium",
                            airdrop.isCompleted ? "text-crypto-green" : "text-crypto-yellow"
                          )}>
                            {airdrop.isCompleted ? "Completed" : "Active"}
                          </p>
                        </div>
                      </div>
                      
                      {airdrop.links && airdrop.links.length > 0 && (
                        <div>
                          <p className="text-muted-foreground text-sm mb-1">Links</p>
                          <div className="flex flex-wrap gap-2">
                            {airdrop.links.slice(0, 3).map(link => (
                              <a 
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs bg-primary/20 hover:bg-primary/30 px-2 py-1 rounded"
                              >
                                {link.name}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            ))}
                            {airdrop.links.length > 3 && (
                              <span className="inline-flex items-center text-xs bg-secondary px-2 py-1 rounded">
                                +{airdrop.links.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(airdrop)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(airdrop.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No airdrops found. Add your first one!</p>
              <Button onClick={handleCreate} className="bg-crypto-green hover:bg-crypto-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Airdrop
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Airdrop Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Airdrop" : "Add New Airdrop"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details of your airdrop" 
                : "Track a new airdrop opportunity by filling out the details below"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Airdrop name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as AirdropCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the airdrop and requirements"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fundingAmount">Funding Amount</Label>
                <Input
                  id="fundingAmount"
                  placeholder="e.g. $1M"
                  value={formData.fundingAmount}
                  onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rewards">Estimated Rewards</Label>
                <Input
                  id="rewards"
                  placeholder="e.g. 500-1000 tokens"
                  value={formData.rewards}
                  onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeCommitment">Time Commitment</Label>
                <Input
                  id="timeCommitment"
                  placeholder="e.g. 1-2 hours"
                  value={formData.timeCommitment}
                  onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workRequired">Work Required</Label>
                <Input
                  id="workRequired"
                  placeholder="e.g. Bridge assets, provide liquidity"
                  value={formData.workRequired}
                  onChange={(e) => setFormData({ ...formData, workRequired: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isCompleted"
                checked={formData.isCompleted}
                onCheckedChange={(checked) => setFormData({ ...formData, isCompleted: checked })}
              />
              <Label htmlFor="isCompleted">Mark as completed</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
              <Label htmlFor="isPinned">Pin to top</Label>
            </div>
            
            {/* Links Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Links ({formData.links?.length || 0}/100)</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBatchLinkInput(!showBatchLinkInput)}
                  >
                    {showBatchLinkInput ? "Hide Batch Input" : "Add Multiple Links"}
                  </Button>
                </div>
              </div>
              
              {showBatchLinkInput ? (
                <div className="space-y-2">
                  <Label>Add Multiple Links (one per line, format: "Name | URL" or just URL)</Label>
                  <Textarea
                    placeholder="Link 1 | https://example.com
https://another-example.com
Third Link | https://third-example.com"
                    value={linksBatch}
                    onChange={(e) => setLinksBatch(e.target.value)}
                    rows={6}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={processBatchLinks}
                  >
                    Add All Links
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      placeholder="Link name"
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex gap-2">
                    <Input
                      placeholder="URL"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                    
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleAddLink}
                      disabled={(formData.links?.length || 0) >= 100}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Link List */}
              {formData.links && formData.links.length > 0 && (
                <div className="border rounded-md p-3">
                  <p className="text-sm font-medium mb-2">Added Links ({formData.links.length})</p>
                  <ScrollArea className="max-h-64 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {formData.links.map(link => (
                        <div key={link.id} className="flex items-center justify-between bg-secondary/50 rounded p-2">
                          <div className="flex items-center overflow-hidden">
                            <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                            <div className="truncate">
                              <p className="text-sm font-medium truncate">{link.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="h-6 w-6 flex items-center justify-center rounded hover:bg-background"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveLink(link.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
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
              {isEditing ? "Update Airdrop" : "Add Airdrop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Airdrops;
