import { Workspace } from "../../../../components/Workspace";

export default async function EventTicketsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <Workspace initialAdminTab="tickets" initialEventId={eventId} />;
}
