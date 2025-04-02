
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, PinIcon, Check, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CategoryManager from "@/components/common/CategoryManager";

const difficultyColors = {
  Easy: "text-green-500",
  Medium: "text-yellow-500",
  Hard: "text-red-500",
};

const Tools = () => {
  const { user } = useAuth();
  const { tools, categories, addTool, updateTool, deleteTool } = useData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    difficulty: 'Easy',
    logoUrl: '',
    url: '',
    isPinned: false,
    isPaid: false,
  });
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);

  const filteredTools = tools.filter(tool => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toolCategories = Array.from(new Set(tools.map(tool => tool.category)));

  const resetFormData = () => {
    setFormData({
      name: '',
      category: toolCategories[0] || '',
      description: '',
      difficulty: 'Easy',
      logoUrl: '',
      url: '',
      isPinned: false,
      isPaid: false,
    });
    setCurrentToolId(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetFormData();
  };

  const handleEdit = (tool: any) => {
    setFormData({
      name: tool.name,
      category: tool.category,
      description: tool.description || '',
      difficulty: tool.difficulty || 'Easy',
      logoUrl: tool.logoUrl || '',
      url: tool.url || '',
      isPinned: tool.isPinned || false,
      isPaid: tool.isPaid || false,
    });
    setCurrentToolId(tool.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      deleteTool(id);
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    updateTool(id, { isPinned: !isPinned });
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    updateTool(id, { isCompleted: !isCompleted });
  };

  const handleFormSubmit = () => {
    if (!formData.name || !formData.category) {
      alert("Name and category are required");
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
          
          <div className="flex gap-2">
            {user?.isAdmin && <CategoryManager type="tool" />}
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}>
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {toolCategories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory || 'all'}>
          {sortedTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTools.map(tool => (
                <Card key={tool.id} className={cn(
                  "border-border/40 transition-all hover:border-primary/30",
                  tool.isPinned && "border-l-4 border-l-crypto-green",
                  tool.isCompleted && "bg-muted/30",
                  tool.isPaid && "border-t-4 border-t-crypto-yellow"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline">{tool.category}</Badge>
                      <div className="flex items-center space-x-1">
                        {tool.isPaid && (
                          <Badge variant="secondary" className="bg-crypto-yellow text-black">
                            PAID
                          </Badge>
                        )}
                        {tool.difficulty && (
                          <Badge variant="outline" className={difficultyColors[tool.difficulty as keyof typeof difficultyColors]}>
                            {tool.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="mt-2 flex items-center">
                      {tool.logoUrl && (
                        <img 
                          src={tool.logoUrl} 
                          alt={tool.name} 
                          className="w-6 h-6 mr-2 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                  </CardHeader>
                  
                  <CardFooter className="flex justify-between pt-0">
                    <div className="flex items-center">
                      {tool.url ? (
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          Visit Tool <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No URL provided</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleComplete(tool.id, tool.isCompleted || false)}
                        title={tool.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                      >
                        <Check className={cn("h-4 w-4", tool.isCompleted && "text-crypto-green")} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTogglePin(tool.id, tool.isPinned || false)}
                        title={tool.isPinned ? "Unpin" : "Pin to Top"}
                      >
                        <PinIcon className={cn("h-4 w-4", tool.isPinned && "text-crypto-green")} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(tool)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(tool.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No tools found in this category.</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          resetFormData();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Tool" : "Add New Tool"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details for this tool" 
                : "Add a new crypto tool or resource"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difficulty" className="text-right">
                Difficulty
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logoUrl" className="text-right">
                Logo URL
              </Label>
              <Input
                id="logoUrl"
                className="col-span-3"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                Tool URL
              </Label>
              <Input
                id="url"
                className="col-span-3"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isPaid" className="text-right">
                Paid Content
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isPaid"
                  checked={formData.isPaid}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                />
                <Label htmlFor="isPaid">Paid</Label>
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
