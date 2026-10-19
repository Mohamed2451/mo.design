/**
 * Load user-uploaded portfolio images close to when they're actually visible.
 * Avoid downloading multiple full-resolution Supabase photos during first paint.
 * Original URLs remain untouched. Falls back to normal loading without IO.
 */
export const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

let observer;
function showImage(image) {
  const url = image.dataset.deferSrc;
  if (!url) return;
  image.src = url;
  image.removeAttribute('data-defer-src');
}
export function watchDeferredImages(root = document) {
  const images = root.querySelectorAll('img[data-defer-src]');
  if (!('IntersectionObserver' in window)) {
    images.forEach(showImage);
    return;
  }
  if (!observer) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        showImage(entry.target);
      }
    }, { rootMargin:'220px 0px', threshold:0.01 });
  }
  images.forEach(image => observer.observe(image));
}
