/* V15 progressive effects: no external dependencies, all content visible by default. */
(() => {
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=window.matchMedia('(pointer: coarse)').matches;
  if(reduced)return;
  const observeBlocks=()=>{
    if(!('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(entries=>{
      for(const item of entries){
        if(!item.isIntersecting)continue;
        item.target.classList.add('v15-visible');
        observer.unobserve(item.target);
      }
    },{rootMargin:'0px 0px -5% 0px',threshold:.08});
    const mark=()=>{
      document.querySelectorAll('.work-section .project-card,.services-section .service-card,.section-head').forEach((node,i)=>{
        if(node.dataset.v15Seen)return;
        node.dataset.v15Seen='1';
        node.style.setProperty('--v15-delay',((i%3)*85)+'ms');
        node.classList.add('v15-inview');
        observer.observe(node);
      });
    };
    mark();
    const grid=document.querySelector('#projectGrid');
    if(grid){
      let pending=false;
      const mutation=new MutationObserver(()=>{
        if(pending)return;
        pending=true;requestAnimationFrame(()=>{pending=false;mark();});
      });
      mutation.observe(grid,{childList:true});
    }
  };
  observeBlocks();
  if(coarse||!window.matchMedia('(hover:hover)').matches)return;
  const featured=document.getElementById('featureStage');
  featured?.addEventListener('pointermove',e=>{
    const rect=featured.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    featured.style.setProperty('--feature-mouse-x',(((e.clientX-rect.left)/rect.width-.5)*2).toFixed(3));
    featured.style.setProperty('--feature-mouse-y',(((e.clientY-rect.top)/rect.height-.5)*2).toFixed(3));
  },{passive:true});
  featured?.addEventListener('pointerleave',()=>{
    featured.style.setProperty('--feature-mouse-x','0');
    featured.style.setProperty('--feature-mouse-y','0');
  });
  document.querySelectorAll('.hero-ctas .pill-btn,.hero-ctas .ghost-btn').forEach(button=>{
    button.classList.add('v15-magnetic');
    button.addEventListener('pointermove',e=>{
      const box=button.getBoundingClientRect();
      button.style.setProperty('--v15-bx',((e.clientX-box.left-box.width/2)*.12).toFixed(1)+'px');
      button.style.setProperty('--v15-by',((e.clientY-box.top-box.height/2)*.12).toFixed(1)+'px');
    },{passive:true});
    button.addEventListener('pointerleave',()=>{
      button.style.setProperty('--v15-bx','0px');
      button.style.setProperty('--v15-by','0px');
    });
  });
})();
