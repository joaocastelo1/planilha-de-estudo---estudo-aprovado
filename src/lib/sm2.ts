export function updateCard(card: any, quality: number) {
  let { easeFactor, interval } = card;

  if (quality < 3) {
    interval = 1;
  } else {
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * 0.08));
    interval = interval * easeFactor;
  }

  return {
    ...card,
    interval,
    easeFactor,
    nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
  };
}
