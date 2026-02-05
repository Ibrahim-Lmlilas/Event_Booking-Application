import { eventsApi } from '@/lib/api/events';
import { ParticipantEventsClient } from '@/components/events/participant/ParticipantEventsClient';

const ITEMS_PER_PAGE = 9;

export default async function ParticipantEventsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  
  try {
    const data = await eventsApi.listPublished(page, ITEMS_PER_PAGE);
    return <ParticipantEventsClient initialData={data} initialPage={page} />;
  } catch (error) {
    // Fallback to empty state if API fails
    const emptyData = {
      events: [],
      total: 0,
      page: 1,
      limit: ITEMS_PER_PAGE,
      totalPages: 0,
    };
    return <ParticipantEventsClient initialData={emptyData} initialPage={1} />;
  }
}
