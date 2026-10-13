import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderRich,textStyle} from '../assets/rich-text.js';
const sample=`الكشف الكبير | مفهوم صالة عرض سيارات\n\n## الجمهور المستهدف\n- عاشق السيارات\n- **شركة فاخرة**\n\nالهدف\n**رسالة أساسية**`;
const result=renderRich(sample);
assert.match(result,/<h3>الجمهور المستهدف<\/h3>/);
assert.match(result,/<li><strong>شركة فاخرة<\/strong><\/li>/);
assert.match(result,/<p>الهدف<br><strong>رسالة أساسية<\/strong><\/p>/);
assert.doesNotMatch(renderRich('<script>alert(1)</script>'),/<script>/);
assert.match(renderRich('<img src=x onerror=alert(1)>'),/&lt;img/);
assert.match(textStyle({font:'Cairo',size:99}),/font-size:30px/);
assert.match(textStyle({font:'Arial',size:3}),/Alexandria/);
for(const path of ['index.html','admin.html','project.html','lesson.html']){
 const html=readFileSync(new URL('../'+path,import.meta.url),'utf8');
 assert.match(html,/v12\.css/);
 assert.match(html,/\?v=12/);
}
for(const path of ['assets/app.js','assets/admin.js','assets/lesson.js','assets/project-dynamic.js']){
 const js=readFileSync(new URL('../'+path,import.meta.url),'utf8');
 assert.ok(js.length>4000);
}
const index=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
assert.match(index,/ticker-segment/);
assert.match(index,/renderNotice/);
const admin=readFileSync(new URL('../assets/admin.js',import.meta.url),'utf8');
assert.match(admin,/clearNotice/);
assert.match(admin,/copyGroup/);
assert.match(admin,/imageCount>15/);
console.log('V12 static checks passed');
