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
  const escapeCss=(value)=>{try{return CSS.escape(value)}catch{return value}};
  const hydrateProjects=()=>{
    const cards=[...document.querySelectorAll('#projectGrid .project-card')];
    const hasVideo=card=>Boolean(card.querySelector('.cover-label')?.textContent?.includes('VIDEO'));
    const videoCards=cards.filter(hasVideo);
    const lead=document.querySelector('#v14MotionLead');
    const label=document.querySelector('#v14MotionLeadName');
    if(!lead||!label)return;
    const lang=getLang();
    if(videoCards.length){
      const first=videoCards[0],link=first.querySelector('a[href]'), title=first.querySelector('.project-meta h3')?.textContent?.trim();
      if(link)lead.setAttribute('href',link.getAttribute('href'));
      if(title){label.textContent=title;label.removeAttribute('data-v14-ar');label.removeAttribute('data-v14-en');}
      for(let i=0;i<2;i++){
        const tile=document.querySelector(i===0?'#v14MotionTileOne':'#v14MotionTileTwo');
        const card=videoCards[i+1];
        if(!tile||!card)continue;
        const href=card.querySelector('a[href]')?.getAttribute('href');
        const img=card.querySelector('.cover-img')?.getAttribute('src');
        const name=card.querySelector('.project-meta h3')?.textContent?.trim();
        if(href)tile.setAttribute('href',href);
        if(img){const el=tile.querySelector('img');if(el)el.src=img;}
        if(name){const strong=tile.querySelector('strong');if(strong){strong.textContent=name;strong.removeAttribute('data-v14-ar');strong.removeAttribute('data-v14-en');}}
      }
    }else {
      lead.setAttribute('href','#work');
      if(!label.hasAttribute('data-v14-ar')){
        label.setAttribute('data-v14-ar','من الفكرة… إلى الحركة.');
        label.setAttribute('data-v14-en','From an idea to motion.');
      }
      label.textContent=lang==='ar'?'من الفكرة… إلى الحركة.':'From an idea to motion.';
    }
  };
  const boot=()=>{
    translations();hydrateProjects();
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