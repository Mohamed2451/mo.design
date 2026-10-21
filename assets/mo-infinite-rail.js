// Scoped endless rail for approved public reviews and saved brand logos.
// Recycles DOM nodes to prevent the empty track at the end of a CSS loop.
export function startRail(track,viewport,speed=112){
 if(!track||!viewport)return;
 track.__moStopRail?.();
 let frame=0,last=0,offset=0,stopped=false;
 const gap=()=>Math.max(0,parseFloat(getComputedStyle(track).columnGap)||0);
 const width=el=>el?.getBoundingClientRect().width||0;
 function normalize(){
  for(let i=0;i<100&&track.children.length>1;i++){
   const first=track.firstElementChild,step=width(first)+gap();
   if(step<=0||offset<step)break;
   offset-=step;track.appendChild(first);
  }
  for(let i=0;i<100&&track.children.length>1&&offset<0;i++){
   const lastChild=track.lastElementChild,step=width(lastChild)+gap();
   if(step<=0)break;
   track.insertBefore(lastChild,track.firstChild);offset+=step;
  }
  track.style.transform='translate3d('+(-offset.toFixed(2))+'px,0,0)';
 }
 const paused=()=>document.hidden||viewport.matches(':hover')||viewport.contains(document.activeElement)||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function tick(now){
  if(stopped)return;
  const delta=last?Math.max(0,Math.min(80,now-last)):0;last=now;
  if(!paused()){offset+=speed*delta/1000;normalize()}
  frame=requestAnimationFrame(tick);
 }
 track.__moRailNudge=direction=>{const step=width(track.firstElementChild)+gap();offset+=(direction||1)*step;normalize()};
 track.__moStopRail=()=>{stopped=true;cancelAnimationFrame(frame);delete track.__moRailNudge;delete track.__moStopRail};
 track.style.animation='none';track.style.transition='none';
 frame=requestAnimationFrame(tick);
}
