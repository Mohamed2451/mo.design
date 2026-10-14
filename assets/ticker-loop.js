// Independent seamless ticker. No legacy ticker animations are used.
(() => {
 const ticker=document.querySelector('.ticker');
 const track=ticker?.querySelector('.ticker-track');
 if(!ticker||!track)return;
 let running=false, lastText='', lastWidth=0;
 const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function build(){
   const strings=(window.moTickerWords||[]).filter(Boolean);
   const initial=track.dataset.words||'مو ديزاين|تصميم إعلانات|مونتاج فيديو|صور وفيديوهات بالذكاء الاصطناعي|برومبتات احترافية';
   const words=strings.length?strings:initial.split('|');
   track.innerHTML='';
   const band=document.createElement('div');band.className='mo-ticker-band';
   const unit=words.map(w=>'<span class="mo-ticker-word">'+htmlEscape(w.trim())+'</span>').join('');
   band.innerHTML=unit;
   track.appendChild(band);
   let tries=0;
   const min=ticker.clientWidth+120;
   while(band.getBoundingClientRect().width<min && tries++<50)band.insertAdjacentHTML('beforeend',unit);
   const clone=band.cloneNode(true);clone.setAttribute('aria-hidden','true');
   track.appendChild(clone);
   const px=band.getBoundingClientRect().width;
   track.style.setProperty('--mo-loop-step',px+'px');
   track.style.setProperty('--mo-loop-duration',Math.max(14,px/90)+'s');
   // This track has only two identical bands. No reset frame is visible.
   track.classList.add('mo-loop-active');
   running=true;lastWidth=ticker.clientWidth;lastText=words.join('|');
 }
 let scheduled=false;
 function requestBuild(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;build();});}
 window.addEventListener('mo:ticker-content-changed',requestBuild);
 window.addEventListener('resize',()=>{if(Math.abs(ticker.clientWidth-lastWidth)>12)requestBuild();},{passive:true});
 if(document.fonts?.ready)document.fonts.ready.then(requestBuild).catch(()=>{});
 requestBuild();
})();
