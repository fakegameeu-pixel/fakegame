import { WinnerDraw } from "../../components/WinnerDraw";

export const metadata = { title: "Розыгрыш | Fake Wedding", robots: { index: false, follow: false } };

export default async function PublicDrawPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <WinnerDraw eventId={eventId} />;
}
