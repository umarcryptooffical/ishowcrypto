
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface CategoryManagerProps {
  type: "airdrop" | "testnet" | "tool" | "video";
  buttonVariant?: "default" | "ghost" | "outline";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

const CategoryManager = ({ type, buttonVariant = "outline", buttonSize = "sm" }: CategoryManagerProps) => {
  const { user, addCategory, getCategories } = useAuth();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  
  const typeLabel = {
    airdrop: "Airdrop",
    testnet: "Testnet",
    tool: "Tool",
    video: "Video"
  }[type];
  
  const handleOpen = () => {
    setCategories(getCategories(type));
    setOpen(true);
  };
  
  const handleAddCategory = () => {
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
    
    const success = addCategory(type, newCategory.trim());
    
    if (success) {
      setCategories(getCategories(type));
      setNewCategory("");
      toast({
        title: "Success",
        description: `New ${typeLabel.toLowerCase()} category added`,
      });
    } else {
      toast({
        title: "Error",
        description: "You don't have permission to add categories",
        variant: "destructive",
      });
    }
  };
  
  // Only admins can manage categories
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
            />
            <Button 
              variant="default" 
              className="bg-crypto-green hover:bg-crypto-green/90"
              onClick={handleAddCategory}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <h4 className="mb-2 text-sm font-medium">Current Categories</h4>
            <ScrollArea className="h-[200px] rounded-md border p-2">
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
