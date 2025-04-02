
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase, TABLES } from "@/integrations/supabase/client";

interface CategoryManagerProps {
  type: "airdrop" | "testnet" | "tool" | "video";
  buttonVariant?: "default" | "ghost" | "outline";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

const CategoryManager = ({ type, buttonVariant = "outline", buttonSize = "sm" }: CategoryManagerProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const typeLabel = {
    airdrop: "Airdrop",
    testnet: "Testnet",
    tool: "Tool",
    video: "Video"
  }[type];
  
  const tableMap = {
    airdrop: TABLES.AIRDROP_CATEGORIES,
    testnet: TABLES.TESTNET_CATEGORIES,
    tool: TABLES.TOOL_CATEGORIES,
    video: TABLES.VIDEO_CATEGORIES,
  } as const;
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from(tableMap[type])
        .select('name')
        .order('name');
        
      if (error) throw error;
      
      setCategories(data.map(item => item.name));
    } catch (error: any) {
      console.error(`Error fetching ${type} categories:`, error);
      toast({
        title: "Error",
        description: `Failed to load ${type} categories: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleOpen = async () => {
    setIsLoading(true);
    await fetchCategories();
    setIsLoading(false);
    setOpen(true);
  };
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Error",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from(tableMap[type])
        .insert({
          name: newCategory.trim(),
          user_id: user?.id
        });
        
      if (error) throw error;
      
      await fetchCategories();
      setNewCategory("");
      
      toast({
        title: "Success",
        description: `New ${typeLabel.toLowerCase()} category added`,
      });
    } catch (error: any) {
      console.error(`Error adding ${type} category:`, error);
      toast({
        title: "Error",
        description: `Failed to add category: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Return nothing if the user is not an admin
  if (!user?.isAdmin) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} onClick={handleOpen}>
          <Settings className="h-4 w-4 mr-1" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage {typeLabel} Categories</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={`New ${typeLabel.toLowerCase()} category`}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
              disabled={isLoading}
            />
            <Button 
              variant="default" 
              className="bg-crypto-green hover:bg-crypto-green/90"
              onClick={handleAddCategory}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <h4 className="mb-2 text-sm font-medium">Current Categories</h4>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="flex items-center bg-crypto-darker"
                    >
                      {category}
                    </Badge>
                  ))}
                  
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No categories found.</p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
