/** Public presentation image resolver. Originals remain a safe fallback. */
export function presentationImage(url) {
  if (typeof url !== 'string' || !/^https:\/\//i.test(url)) return url;
  const file=window.MO_OPTIMIZED_IMAGES?.[url];
  return typeof file==='string' && /^[a-f0-9]{24}\.webp$/.test(file)
    ? './assets/optimized/'+file : url;
}
