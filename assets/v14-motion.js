/* Progressive motion; decorative only, safe if content fails to load. */
(() => {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const progress=document.createElement('div');
  progress.className='mo14-scroll-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.appendChild(progress);
  let scrollPending=false;
  const updateProgress=()=>{
    scrollPending=false;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,window.scrollY/max)):0)+')';
  };
  window.addEventListener('scroll',()=>{
    if(!scrollPending){scrollPending=true;requestAnimationFrame(updateProgress);}
  },{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});
  updateProgress();
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  // Delegated pointer glow also works on project cards rendered later from Supabase.
  const grid=document.querySelector('#projectGrid');
  grid?.addEventListener('pointermove',event=>{
    const card=event.target.closest('.project-card');
    if(!card)return;
    const box=card.getBoundingClientRect();
    card.style.setProperty('--mo14-mx',((event.clientX-box.left)/box.width*100).toFixed(1)+'%');
    card.style.setProperty('--mo14-my',((event.clientY-box.top)/box.height*100).toFixed(1)+'%');
  },{passive:true});
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
