export const ease = {
  out: [0.22, 1, 0.36, 1] as const, // default for entrances
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: { type: "spring", stiffness: 260, damping: 24 } as const,
};

export const dur = {
  xs: 0.15,
  sm: 0.25,
  md: 0.5,
  lg: 0.8,
  xl: 1.2,
};

export const stagger = 0.06;

export const reveal = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * stagger, duration: dur.lg, ease: ease.out },
  }),
};
