import { Workspace } from "../../../../components/Workspace";

export default async function PhotosPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <Workspace initialAdminTab="photos" initialEventId={eventId} />;
}
