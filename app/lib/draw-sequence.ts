type Card = { id: string; name: string; url: string };

export function buildDrawSequence<T extends Card>(photos: T[], target: T): Array<T | Card> {
  const others: Card[] = [...new Map(photos.filter((photo) => photo.id !== target.id).map((photo) => [photo.id, photo])).values()];
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const cycle = [target, ...others];
  return Array.from({ length: 52 }, (_, index) => cycle[((index - 48) % cycle.length + cycle.length) % cycle.length]);
}
