export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const stagger = (delay = 0.08) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: delay, delayChildren: 0.1 },
  },
});
