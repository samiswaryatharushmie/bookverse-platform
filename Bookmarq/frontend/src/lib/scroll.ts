export const smoothScrollTo = (targetY: number, duration: number = 1000) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();
  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };
  requestAnimationFrame(animateScroll);
};
