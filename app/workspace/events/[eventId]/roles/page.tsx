import { Workspace } from "../../../../components/Workspace";

export default async function RolesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <Workspace initialAdminTab="roles" initialEventId={eventId} />;
}
