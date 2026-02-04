import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

type Props = {
  onCreateClick: () => void;
};

export function AdminEventsEmpty({ onCreateClick }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No events yet.</p>
      <Button onClick={onCreateClick} variant="outline" className="mt-4">
        Create your first event
      </Button>
    </div>
  );
}
