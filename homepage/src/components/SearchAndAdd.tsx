
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchAndAddProps {
  searchPlaceholder: string;
  addButtonText: string;
  onSearch: (query: string) => void;
  onAdd: () => void;
  className?: string;
}

const SearchAndAdd = ({ 
  searchPlaceholder, 
  addButtonText, 
  onSearch, 
  onAdd,
  className = ''
}: SearchAndAddProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const handleAdd = () => {
    onAdd();
    toast({
      title: "Add New",
      description: `${addButtonText} action triggered`,
    });
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-blue/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue placeholder:text-cyber-blue/50"
          />
        </div>
        <Button 
          type="submit"
          variant="outline"
          className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
        >
          <Search className="w-4 h-4" />
        </Button>
      </form>
      
      <Button 
        onClick={handleAdd}
        className="bg-cyber-yellow/20 border-cyber-yellow/30 text-cyber-yellow hover:bg-cyber-yellow/30"
      >
        <Plus className="w-4 h-4 mr-2" />
        {addButtonText}
      </Button>
    </div>
  );
};

export default SearchAndAdd;
