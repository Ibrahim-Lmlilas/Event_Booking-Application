import { eventsApi } from '@/lib/api/events';
import { ParticipantEventsClient } from '@/components/events/participant/ParticipantEventsClient';

const ITEMS_PER_PAGE = 9;

export default async function ParticipantEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  try {
    const data = await eventsApi.listPublished(page, ITEMS_PER_PAGE);
    return <ParticipantEventsClient initialData={data} initialPage={page} />;
  } catch (error) {
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
