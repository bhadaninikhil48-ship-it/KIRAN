import gsap from "gsap";

export const isReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const animateFadeIn = (target, options = {}) => {
  if (!target || isReducedMotion()) return;
  const { delay = 0, duration = 0.4, y = 16 } = options;
  gsap.fromTo(
    target,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
      clearProps: "transform,opacity",
    }
  );
};

export const animateStagger = (targets, options = {}) => {
  if (!targets || isReducedMotion()) return;
  const { delay = 0.05, stagger = 0.08, duration = 0.4, y = 14 } = options;
  gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: "power2.out",
      clearProps: "transform,opacity",
    }
  );
};

export const animateCounter = (targetElement, targetNumber, duration = 1.2) => {
  if (!targetElement) return;
  if (isReducedMotion()) {
    targetElement.textContent = String(targetNumber);
    return;
  }

  const obj = { val: 0 };
  gsap.to(obj, {
    val: targetNumber,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      targetElement.textContent = Math.round(obj.val).toString();
    },
  });
};

export const animateReveal = (target, options = {}) => {
  if (!target || isReducedMotion()) return;
  const { duration = 0.35 } = options;
  gsap.fromTo(
    target,
    { opacity: 0, height: 0, overflow: "hidden" },
    {
      opacity: 1,
      height: "auto",
      duration,
      ease: "power2.out",
      clearProps: "overflow",
    }
  );
};
