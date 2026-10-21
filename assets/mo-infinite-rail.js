// A truly endless marquee: recycle an item as it leaves the viewport.
// Avoids CSS-loop group-size drift and empty trailing tracks.
export function startRail(track, viewport, speed=112){
 if(!track||!viewport)return;
 if(track.__moStopRail)track.__moStopRail();
 let raf=0,last=0,offset=0,stopped=false;
 const gap=()=>Math.max(0,parseFloat(getComputedStyle(track).columnGap)||0);
 const width=el=>el?.getBoundingClientRect().width||0;
 const normalize=()=>{
  let guard=0;
  while(track.children.length>1&&guard++<50){
   const first=track.firstElementChild,step=width(first)+gap();
   if(step<=0||offset<step)break;
   offset-=step;track.appendChild(first);
  }
  guard=0;
  while(track.children.length>1&&offset<0&&guard++<50){
   const lastChild=track.lastElementChild,step=width(lastChild)+gap();
   if(step<=0)break;
   track.insertBefore(lastChild,track.firstChild);offset+=step;
  }
  track.style.transform='translate3d('+(-offset.toFixed(2))+'px,0,0)';
 };
 const isPaused=()=>document.hidden||viewport.matches(':hover')||viewport.contains(document.activeElement)||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tick=now=>{
  if(stopped)return;
  const delta=last?Math.min(80,Math.max(0,now-last)):0;last=now;
  if(!isPaused()){offset+=speed*delta/1000;normalize();}
  raf=requestAnimationFrame(tick);
 };
 track.__moRailNudge=direction=>{
  const first=track.firstElementChild;
  if(!first)return;
  offset+=(direction||1)*(width(first)+gap());normalize();
 };
 track.__moStopRail=()=>{stopped=true;cancelAnimationFrame(raf);delete track.__moRailNudge;delete track.__moStopRail;};
 track.style.animation='none';track.style.transition='none';
 raf=requestAnimationFrame(tick);
}
