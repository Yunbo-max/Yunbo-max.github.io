/* Optional presentation only. Research playback and case content remain independent. */
(() => {
  'use strict';
  const page = document.querySelector('.project-page.project-editorial');
  if (!page) return;
  const progress = page.querySelector('.reading-line span');
  let scheduled = false;
  const paintProgress = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    if (progress) progress.style.transform = `scaleX(${fraction})`;
    scheduled = false;
  };
  const scheduleProgress = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(paintProgress);
  };
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });
  window.addEventListener('load', scheduleProgress, { once: true });
  page.addEventListener('toggle', scheduleProgress, true);
  paintProgress();

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('editorial-in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  page.querySelectorAll('.catalog-heading,.observer-statement,.case-story,.observer-method,.beta-section')
    .forEach((element) => observer.observe(element));
})();
