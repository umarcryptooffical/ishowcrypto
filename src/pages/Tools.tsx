
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, ToolCategory } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const categories: ToolCategory[] = [
  'Wallet Connect',
  'Airdrop Claim Checker',
  'Gas Fee Calculator',
  'Testnet Token Faucets',
  'Crypto Wallet Extensions',
  'Swaps & Bridges',
];

const Tools = () => {
  const { user } = useAuth();
  const { tools, addTool, updateTool, deleteTool } = useData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ToolCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Wallet Connect' as ToolCategory,
    description: '',
    url: '',
  });
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);

  // Get user's tools + demo tools
  const userTools = tools.filter(tool => 
    tool.userId === user?.id || tool.userId === 'demo'
  );

  // Filter tools based on selected tab and search
  const filteredTools = userTools.filter(tool => {
    const matchesTab = selectedTab === 'All' || tool.category === selectedTab;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort tools by creation date (newest first)
  const sortedTools = [...filteredTools].sort((a, b) => b.createdAt - a.createdAt);

  const resetFormData = () => {
    setFormData({
      title: '',
      category: 'Wallet Connect',
      description: '',
      url: '',
    });
    setCurrentToolId(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetFormData();
  };

  const handleEdit = (tool: any) => {
    setFormData({
      title: tool.title,
      category: tool.category,
      description: tool.description,
      url: tool.url,
    });
    setCurrentToolId(tool.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      deleteTool(id);
    }
  };

  const handleFormSubmit = () => {
    if (!formData.title || !formData.category || !formData.url) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && currentToolId) {
      updateTool(currentToolId, formData);
      setIsEditing(false);
    } else {
      addTool(formData);
      setIsCreating(false);
    }
    
    resetFormData();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Crypto Tools</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tool
          </Button>
        </div>
      </div>

      <Tabs defaultValue="All" value={selectedTab} onValueChange={(value) => setSelectedTab(value as ToolCategory | 'All')}>
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          <TabsTrigger value="All">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab}>
          {sortedTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTools.map(tool => (
                <Card key={tool.id} className="border-border/40 transition-all hover:border-primary/30">
                  <CardHeader className="pb-2">
                    <Badge variant="outline">{tool.category}</Badge>
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <a 
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80"
                    >
                      Visit Tool
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tool)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(tool.id)}
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
              <p className="text-muted-foreground mb-4">No tools found. Add your first one!</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Tool Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Tool" : "Add New Tool"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details of your crypto tool" 
                : "Add a new crypto tool to your collection"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Tool name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ToolCategory })}
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this tool does"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
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
              {isEditing ? "Update Tool" : "Add Tool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tools;
