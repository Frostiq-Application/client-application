import type { Transition, Variants } from "framer-motion";

/** iOS-like spring for push/pop and sheets. */
export const IOS_SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

export const EASE_OUT: Transition = { duration: 0.22, ease: [0.32, 0.72, 0, 1] };

/** Push navigation: new screen slides in from the right, old parallax-shifts left. */
export const pagePush: Variants = {
  initial: { opacity: 0, x: "30%" },
  animate: { opacity: 1, x: 0, transition: IOS_SPRING },
  exit: { opacity: 0, x: "-15%", transition: EASE_OUT },
};

/** Tab switch: gentle cross-fade with a hint of lift. */
export const tabFade: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: EASE_OUT },
  exit: { opacity: 0, y: -8, transition: EASE_OUT },
};

/** Bottom sheet slide up. */
export const sheetSlide: Variants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: IOS_SPRING },
  exit: { y: "100%", transition: EASE_OUT },
};

/** Backdrop fade for modals/sheets. */
export const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: EASE_OUT },
  exit: { opacity: 0, transition: EASE_OUT },
};

/** Staggered list entrance. */
export const listContainer: Variants = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export const listItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: EASE_OUT },
};

/** Tap feedback scale used by pressable elements. */
export const tapScale = { scale: 0.96 } as const;
