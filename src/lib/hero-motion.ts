/** Above-the-fold hero: short, staggered entrance without long blank states. */
export const heroEase = [0.22, 1, 0.36, 1] as const;

export const heroStagger = {
  role: { duration: 0.45, delay: 0 },
  aside: { duration: 0.5, delay: 0.08 },
  intro: { duration: 0.5, delay: 0.12 },
  cta: { duration: 0.45, delay: 0.2 },
  bulletBase: 0.22,
  bulletStep: 0.04,
  nameWordBase: 0.06,
  nameWordStep: 0.045,
  nameDuration: 0.5,
} as const;
