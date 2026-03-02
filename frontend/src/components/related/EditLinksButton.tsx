import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';

interface EditLinksButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function EditLinksButton({ onClick, disabled = false }: EditLinksButtonProps) {
  return (
    <Button onClick={onClick} variant="outline" disabled={disabled}>
      <LinkIcon className="h-4 w-4 mr-2" />
      Edit Links
    </Button>
  );
}
