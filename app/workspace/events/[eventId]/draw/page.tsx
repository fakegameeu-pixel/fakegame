import { WinnerDraw } from "../../../../components/WinnerDraw";

export default async function DrawPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <WinnerDraw eventId={eventId} />;
}
