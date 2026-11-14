import { Workspace } from "../../../../components/Workspace";

export default async function ParticipantsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <Workspace initialAdminTab="participants" initialEventId={eventId} />;
}
