import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
  onCreateClick: () => void;
};

export function AdminEventsHeader({ onCreateClick }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
      </div>
      <Button onClick={onCreateClick} className="bg-gray-900 hover:bg-pink-500">
        <Plus className="h-4 w-4 mr-2" />
        Create event
      </Button>
    </div>
  );
}
