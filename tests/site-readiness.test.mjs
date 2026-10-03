import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const pages = [];
function walk(dir) {
  for (const item of readdirSync(dir,{withFileTypes:true})) {
    const path=join(dir,item.name);
    if(item.isDirectory())walk(path);
    else if(item.name.endsWith('.html'))pages.push(path);
  }
}
walk('dist');
test('all built pages have canonical metadata, sitemap entries and image alternatives',()=>{
  const sitemap=readFileSync('dist/sitemap.xml','utf8');
  const titles=new Set();
  for(const path of pages){
    const html=readFileSync(path,'utf8');
    const url='https://everiart.com/'+relative('dist',path).replaceAll('\\','/').replace(/index\.html$/,'');
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`),path);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`),path);
    assert.match(html,/<meta property="og:image" content="https:\/\/everiart.com\//);
    const title=html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title),`Duplicate title: ${title}`);titles.add(title);
    for(const image of html.matchAll(/<img\b[^>]*>/g))assert.match(image[0],/\balt="[^"]*"/,path);
    assert.doesNotMatch(html,/<iframe|fonts\.googleapis\.com|fonts\.gstatic\.com/);
  }
});
test('public output excludes server code, policy drafts and credentials; CSP allows only known inline scripts',()=>{
  for(const path of ['.env','.git','node_modules','netlify','projects.json','POLICY-DRAFTS.md','package.json'])assert.equal(existsSync(join('dist',path)),false,path);
  const headers=readFileSync('dist/_headers','utf8');
  assert.match(headers,/object-src 'none'/);
  assert.match(headers,/form-action 'self'/);
  assert.doesNotMatch(headers,/script-src[^;]*'unsafe-/);
  for(const path of pages){
    for(const [,attrs,code]of readFileSync(path,'utf8').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
      if(!/\bsrc=/.test(attrs)&&code.trim())assert.ok(headers.includes(createHash('sha256').update(code).digest('base64')),path);
    }
  }
});
test('unapproved descriptive copy is not published as approved case-study text',()=>{
  const {projects}=JSON.parse(readFileSync('projects.json','utf8'));
  for(const project of projects.filter(p=>p.published&&p.copyStatus!=='approved')){
    const html=readFileSync(`dist/work/${project.slug}/index.html`,'utf8');
    assert.match(html,/Explore the selected work below/);
    assert.doesNotMatch(html,/<dt>Role<\/dt>/);
  }
});
