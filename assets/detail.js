// Standalone static pages: shareable deep-links with bilingual presentation.
const page=document.documentElement;
function update(){
 let l='ar',t='dark'; try{l=localStorage.getItem('portfolio_lang')==='en'?'en':'ar';t=localStorage.getItem('portfolio_theme')==='light'?'light':'dark';}catch(e){}
 page.lang=l;page.dir=l==='ar'?'rtl':'ltr';page.classList.toggle('light',t==='light');
 document.querySelectorAll('[data-lang]').forEach(el=>{el.hidden=el.dataset.lang!==l;});
 document.querySelectorAll('[data-detail-logo]').forEach(img=>{img.src=`${page.dataset.root||'../../'}assets/images/mo-logo-${t==='light'?'black':'white'}.webp`;});
 document.querySelectorAll('[data-theme]').forEach(el=>el.textContent=t==='dark'?'☼':'☾');
 document.querySelectorAll('[data-switch-lang]').forEach(el=>el.textContent=l==='ar'?'EN':'ع');
}
document.addEventListener('click',e=>{
 const lang=e.target.closest('[data-switch-lang]'), theme=e.target.closest('[data-theme]');
 if(lang){localStorage.setItem('portfolio_lang',page.lang==='ar'?'en':'ar');update();}
 if(theme){localStorage.setItem('portfolio_theme',page.classList.contains('light')?'dark':'light');update();}
});
update();
