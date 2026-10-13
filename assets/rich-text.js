import {escapeHTML as esc} from './data.js';
// Deliberately small, safe Markdown subset. Raw HTML is never executed.
export function renderRich(value) {
 const source=String(value||'').replace(/\r\n?/g,'\n').slice(0,60000);
 function inline(text){
  let v=esc(text);
  v=v.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>')
    .replace(/__([^_\n]+)__/g,'<strong>$1</strong>')
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g,'<em>$1</em>');
  return v;
 }
 const blocks=[];let paragraph=[];let ul=[];
 function flushParagraph(){if(paragraph.length){blocks.push('<p>'+paragraph.map(inline).join('<br>')+'</p>');paragraph=[];}}
 function flushList(){if(ul.length){blocks.push('<ul>'+ul.map(line=>'<li>'+inline(line)+'</li>').join('')+'</ul>');ul=[];}}
 for(const line of source.split('\n')){
  if(!line.trim()){flushParagraph();flushList();continue;}
  const h=line.match(/^(#{1,3})\s+(.+)$/);
  if(h){flushParagraph();flushList();const level=Math.min(3,h[1].length+1);blocks.push(`<h${level}>${inline(h[2])}</h${level}>`);continue;}
  const item=line.match(/^\s*[-•]\s+(.+)$/);
  if(item){flushParagraph();ul.push(item[1]);continue;}
  flushList();paragraph.push(line);
 }
 flushParagraph();flushList();return blocks.join('');
}
export function textStyle(raw){
 const o=raw && typeof raw==='object'?raw:{};
 const allowed=['Alexandria','Cairo','Readex Pro','IBM Plex Sans Arabic'];
 const font=allowed.includes(o.font)?o.font:'Alexandria';
 const size=Math.max(14,Math.min(30,Number(o.size)||17));
 return `font-family:'${font}',sans-serif;font-size:${size}px`;
}
