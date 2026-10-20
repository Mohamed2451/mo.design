/* V14 home integration: current language follows existing app; motion links use only published project cards.
   No writes to Supabase, no autoplay, no fake reviews or stats. */
(()=>{'use strict';
  const getLang=()=>document.documentElement.lang==='en'?'en':'ar';
  const translations=()=>{
    const lang=getLang();
    document.querySelectorAll('[data-v14-ar][data-v14-en]').forEach(node=>{
      node.textContent=node.getAttribute('data-v14-'+lang);
    });
    const link=document.querySelector('#v14MotionLead');
    if(link)link.setAttribute('aria-label',lang==='en'?'Open featured motion project':'افتح مشروع الموشن المختار');
  };
  const mediaUrl=(value)=>{try{const u=new URL(value,location.href);return u.protocol==='https:'||u.origin===location.origin?u:null}catch{return null}};
  const openVideo=(raw)=>{
    const u=mediaUrl(raw);if(!u)return false;
    const youtube=/^(www\\.)?(youtube\\.com|youtu\\.be)$/.test(u.hostname);
    const videoId=youtube?(u.hostname.includes('youtu.be')?u.pathname.slice(1):u.searchParams.get('v')):null;
    if(youtube&&!/^[A-Za-z0-9_-]{11}$/.test(videoId||''))return false;
    const direct=!youtube&&/\\.(mp4|webm|ogg)$/i.test(u.pathname);
    if(!youtube&&!direct)return false;
    let dialog=document.getElementById('v14MediaDialog');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='v14MediaDialog';dialog.className='v14-media-dialog';dialog.innerHTML='<div class="v14-media-shell"><button type="button" class="v14-media-close" aria-label="Close video">×</button><div class="v14-media-stage"></div></div>';document.body.appendChild(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('close',()=>dialog.querySelector('.v14-media-stage').replaceChildren());}
    const stage=dialog.querySelector('.v14-media-stage');stage.replaceChildren();
    if(youtube){const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+videoId+'?autoplay=1';frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.title='Mo Design video';stage.appendChild(frame);}
    else {const video=document.createElement('video');video.src=u.href;video.controls=true;video.autoplay=true;video.playsInline=true;stage.appendChild(video);}
    dialog.showModal();return true;
  };
  const hydrateProjects=()=>{
    const cards=[...document.querySelectorAll('#projectGrid .project-card')];
    const hasVideo=card=>Boolean(card.dataset.v14Video||card.dataset.v14Youtube);
    const videoCards=cards.filter(hasVideo);
    const lead=document.querySelector('#v14MotionLead');
    const label=document.querySelector('#v14MotionLeadName');
    if(!lead||!label)return;
    const lang=getLang();
    if(videoCards.length){
      const first=videoCards[0],link=first.querySelector('a[href]'), title=first.querySelector('.project-meta h3')?.textContent?.trim();
      if(link)lead.setAttribute('href',link.getAttribute('href'));
      lead.dataset.videoSrc=first.dataset.v14Video||first.dataset.v14Youtube||'';
      if(title){label.textContent=title;label.removeAttribute('data-v14-ar');label.removeAttribute('data-v14-en');}
      for(let i=0;i<2;i++){
        const tile=document.querySelector(i===0?'#v14MotionTileOne':'#v14MotionTileTwo');
        const card=videoCards[i+1];
        if(!tile||!card)continue;
        const href=card.querySelector('a[href]')?.getAttribute('href');
        const img=card.querySelector('.cover-img')?.getAttribute('src');
        const name=card.querySelector('.project-meta h3')?.textContent?.trim();
        if(href)tile.setAttribute('href',href);
        tile.dataset.videoSrc=card.dataset.v14Video||card.dataset.v14Youtube||'';
        if(img){const el=tile.querySelector('img');if(el)el.src=img;}
        if(name){const strong=tile.querySelector('strong');if(strong){strong.textContent=name;strong.removeAttribute('data-v14-ar');strong.removeAttribute('data-v14-en');}}
      }
    }else {
      lead.setAttribute('href','#work');delete lead.dataset.videoSrc;
      if(!label.hasAttribute('data-v14-ar')){
        label.setAttribute('data-v14-ar','من الفكرة… إلى الحركة.');
        label.setAttribute('data-v14-en','From an idea to motion.');
      }
      label.textContent=lang==='ar'?'من الفكرة… إلى الحركة.':'From an idea to motion.';
    }
  };
  const boot=()=>{
    translations();hydrateProjects();
    document.querySelectorAll('#v14MotionLead,#v14MotionTileOne,#v14MotionTileTwo').forEach(link=>link.addEventListener('click',e=>{if(link.dataset.videoSrc&&openVideo(link.dataset.videoSrc))e.preventDefault();}));
    const langBtn=document.querySelector('#langToggle');
    langBtn?.addEventListener('click',()=>queueMicrotask(()=>{translations();hydrateProjects()}));
    const grid=document.querySelector('#projectGrid');
    if(grid && window.MutationObserver){
      const observer=new MutationObserver(()=>hydrateProjects());
      observer.observe(grid,{childList:true});
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();