
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, TestnetCategory, Testnet, TestnetTask } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Link as LinkIcon, PinIcon, ExternalLink, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const categories: TestnetCategory[] = [
  'Galxe Testnet',
  'Bridge Mining',
  'Mining Sessions',
];

const Testnets = () => {
  const { user } = useAuth();
  const { testnets, addTestnet, updateTestnet, deleteTestnet, updateTestnetTask } = useData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TestnetCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Testnet>>({
    title: '',
    category: 'Galxe Testnet',
    description: '',
    progress: 0,
    rewards: '',
    tasks: [],
    isCompleted: false,
    isPinned: false,
  });
  const [currentTestnetId, setCurrentTestnetId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');

  // Get user's testnets + demo testnets
  const userTestnets = testnets.filter(testnet => 
    testnet.userId === user?.id || testnet.userId === 'demo'
  );

  // Filter testnets based on selected tab and search
  const filteredTestnets = userTestnets.filter(testnet => {
    const matchesTab = selectedTab === 'All' || testnet.category === selectedTab;
    const matchesSearch = testnet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testnet.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort testnets: pinned first, then by creation date (newest first)
  const sortedTestnets = [...filteredTestnets].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const resetFormData = () => {
    setFormData({
      title: '',
      category: 'Galxe Testnet',
      description: '',
      progress: 0,
      rewards: '',
      tasks: [],
      isCompleted: false,
      isPinned: false,
    });
    setNewTaskName('');
    setNewTaskUrl('');
    setCurrentTestnetId(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetFormData();
  };

  const handleEdit = (testnet: Testnet) => {
    setFormData({ ...testnet });
    setCurrentTestnetId(testnet.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this testnet?')) {
      deleteTestnet(id);
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    updateTestnet(id, { isPinned: !isPinned });
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    updateTestnet(id, { isCompleted: !isCompleted });
  };

  const handleToggleTaskComplete = (testnetId: string, taskId: string, isCompleted: boolean) => {
    updateTestnetTask(testnetId, taskId, !isCompleted);
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

    // Calculate progress based on completed tasks
    if (formData.tasks && formData.tasks.length > 0) {
      const completedTasks = formData.tasks.filter(task => task.isCompleted).length;
      formData.progress = Math.round((completedTasks / formData.tasks.length) * 100);
    }

    if (isEditing && currentTestnetId) {
      updateTestnet(currentTestnetId, formData);
      setIsEditing(false);
    } else {
      addTestnet(formData as Omit<Testnet, 'id' | 'userId' | 'createdAt'>);
      setIsCreating(false);
    }
    
    resetFormData();
  };

  const handleAddTask = () => {
    if (!newTaskName || !newTaskUrl) {
      toast({
        title: "Missing task information",
        description: "Please provide both name and URL for the task.",
        variant: "destructive",
      });
      return;
    }

    if (formData.tasks && formData.tasks.length >= 50) {
      toast({
        title: "Maximum tasks reached",
        description: "You can add up to 50 tasks per testnet.",
        variant: "destructive",
      });
      return;
    }

    // Add the new task to the form data
    const newTask: TestnetTask = {
      id: Date.now().toString(),
      name: newTaskName,
      url: newTaskUrl,
      isCompleted: false,
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask],
    }));

    // Reset task form fields
    setNewTaskName('');
    setNewTaskUrl('');
  };

  const handleRemoveTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.filter(task => task.id !== taskId) || [],
    }));
  };

  const handleTaskCompletionChange = (taskId: string, isCompleted: boolean) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.map(task => 
        task.id === taskId ? { ...task, isCompleted } : task
      ) || [],
    }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Testnets</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search testnets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testnet
          </Button>
        </div>
      </div>

      <Tabs defaultValue="All" value={selectedTab} onValueChange={(value) => setSelectedTab(value as TestnetCategory | 'All')}>
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          <TabsTrigger value="All">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab}>
          {sortedTestnets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTestnets.map(testnet => (
                <Card key={testnet.id} className={cn(
                  "border-border/40 transition-all hover:border-primary/30",
                  testnet.isPinned && "border-l-4 border-l-crypto-yellow"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="outline">{testnet.category}</Badge>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleTogglePin(testnet.id, testnet.isPinned)}
                        >
                          <PinIcon className={cn("h-4 w-4", testnet.isPinned ? "text-crypto-yellow fill-crypto-yellow" : "")} />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{testnet.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{testnet.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">{testnet.progress}%</span>
                        </div>
                        <Progress value={testnet.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Rewards</p>
                          <p className="font-medium">{testnet.rewards || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className={cn(
                            "font-medium",
                            testnet.isCompleted ? "text-crypto-green" : "text-crypto-blue"
                          )}>
                            {testnet.isCompleted ? "Completed" : "In Progress"}
                          </p>
                        </div>
                      </div>
                      
                      {testnet.tasks && testnet.tasks.length > 0 && (
                        <div>
                          <p className="text-muted-foreground text-sm mb-1">Tasks</p>
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                            {testnet.tasks.slice(0, 3).map(task => (
                              <div 
                                key={task.id}
                                className="flex items-center gap-2 bg-secondary/30 rounded p-2"
                              >
                                <Checkbox 
                                  checked={task.isCompleted}
                                  onCheckedChange={() => handleToggleTaskComplete(testnet.id, task.id, task.isCompleted)}
                                  className="data-[state=checked]:bg-crypto-green data-[state=checked]:text-primary-foreground"
                                />
                                <div className="flex-1 truncate">
                                  <span className={cn(
                                    "text-sm truncate",
                                    task.isCompleted && "line-through text-muted-foreground"
                                  )}>
                                    {task.name}
                                  </span>
                                </div>
                                <a 
                                  href={task.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                            {testnet.tasks.length > 3 && (
                              <div className="text-center text-xs text-muted-foreground py-1">
                                +{testnet.tasks.length - 3} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-0">
                    <Button
                      variant={testnet.isCompleted ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleToggleComplete(testnet.id, testnet.isCompleted)}
                    >
                      {testnet.isCompleted ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Completed
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(testnet)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(testnet.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No testnets found. Add your first one!</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Testnet
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Testnet Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Testnet" : "Add New Testnet"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details of your testnet" 
                : "Track a new testnet by filling out the details below"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Testnet name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as TestnetCategory })}
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
                placeholder="Describe the testnet and requirements"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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
            
            {/* Tasks Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Tasks</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.tasks?.length || 0}/50 tasks
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Input
                    placeholder="Task name"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2 flex gap-2">
                  <Input
                    placeholder="URL"
                    value={newTaskUrl}
                    onChange={(e) => setNewTaskUrl(e.target.value)}
                  />
                  
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleAddTask}
                    disabled={(formData.tasks?.length || 0) >= 50}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Task List */}
              {formData.tasks && formData.tasks.length > 0 && (
                <div className="border rounded-md p-3">
                  <p className="text-sm font-medium mb-2">Tasks</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {formData.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between bg-secondary/50 rounded p-2">
                        <div className="flex items-center flex-1 mr-2">
                          <Checkbox
                            checked={task.isCompleted}
                            onCheckedChange={(checked) => 
                              handleTaskCompletionChange(task.id, checked as boolean)
                            }
                            className="mr-2 data-[state=checked]:bg-crypto-green data-[state=checked]:text-primary-foreground"
                          />
                          <div className="truncate">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              task.isCompleted && "line-through text-muted-foreground"
                            )}>
                              {task.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{task.url}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveTask(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
            <Button onClick={handleFormSubmit}>
              {isEditing ? "Update Testnet" : "Add Testnet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testnets;
