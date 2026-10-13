/* Progressive motion; decorative only, safe if content fails to load. */
(() => {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  const hero=document.querySelector('.hero');
  const art=document.querySelector('.hero-art');
  if(!hero||!art)return;
  let frame=0,dx=0,dy=0;
  const update=()=>{
    frame=0;
    art.style.setProperty('--mo14-x',(dx*9).toFixed(1)+'px');
    art.style.setProperty('--mo14-y',(dy*8).toFixed(1)+'px');
  };
  hero.addEventListener('pointermove',e=>{
    const bounds=hero.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    dx=(e.clientX-bounds.left)/bounds.width-.5;
    dy=(e.clientY-bounds.top)/bounds.height-.5;
    if(!frame)frame=requestAnimationFrame(update);
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{
    dx=dy=0;if(!frame)frame=requestAnimationFrame(update);
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){dx=dy=0;if(!frame)frame=requestAnimationFrame(update);}
  });
})();
