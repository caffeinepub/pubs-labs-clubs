import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface EntityOption {
  id: string;
  label: string;
}

interface MultiSelectListProps {
  label: string;
  options: EntityOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function MultiSelectList({
  label,
  options,
  selectedIds,
  onChange
}: MultiSelectListProps) {
  const [filter, setFilter] = useState('');

  const filteredOptions = useMemo(() => {
    if (!filter.trim()) return options;
    const lowerFilter = filter.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(lowerFilter)
    );
  }, [options, filter]);

  const selectedCount = selectedIds.length;

  const toggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Search ${label.toLowerCase()}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[200px] border rounded-md p-3">
        {filteredOptions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No results
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${label}-${option.id}`}
                  checked={selectedIds.includes(option.id)}
                  onCheckedChange={() => toggleId(option.id)}
                />
                <label
                  htmlFor={`${label}-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
