import { Workspace } from "../../../components/Workspace";

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <Workspace initialAdminTab="event-detail" initialEventId={eventId} />;
}
