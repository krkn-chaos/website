'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const cheerio = require('cheerio');
function backend(axios) {
 const sandbox = { require: name => name === 'axios' ? axios : cheerio, exports: {}, URL };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../netlify/functions/krkn-operator-version.js'),'utf8'), sandbox);
 return sandbox.exports.handler;
}
test('stable release remains discoverable behind an RC-only first page', async()=> {
 const urls=[];
 const handler=backend({head:async()=>({headers:{location:'/krkn-chaos/krkn-operator/releases/tag/v1.1.0-rc7'}}),get:async url=> {
 urls.push(url);return {data:urls.length===1 ? '<div class="Box"><a href="/krkn-chaos/krkn-operator/releases/tag/v1.1.0-rc7">RC</a></div><a class="next_page" href="?page=2">Next</a>' : '<div class="Box"><a href="/krkn-chaos/krkn-operator/releases/tag/v1.0.0">stable</a></div>'};
 }});
 const result=await handler();assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).version,'v1.0.0');assert.equal(urls.length,2);
});
test('pagination never follows another host', async()=> {
 let count=0;const result=await backend({head:async()=>({headers:{}}),get:async()=>{count++;return {data:'<a class="next_page" href="https://evil.invalid/releases">Next</a>'};}})();
 assert.equal(result.statusCode,404);assert.equal(count,1);
});
async function browser(response) {
 const display={textContent:'loading...',innerHTML:''};const pre={hidden:false,textContent:'helm install --version <VERSION>'};const code={textContent:'helm install --version <VERSION>',closest:()=>pre};
 const context={document:{readyState:'complete',getElementById:()=>display,querySelectorAll:(selector)=>selector==='pre'?[pre]:[code]},fetch:async()=>response};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../static/js/krkn-operator-version.js'),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));return {display,pre,code};
}
test('failed loading exposes a release link instead of unresolved installation commands',async()=> {
 const {display,pre}=await browser({ok:false,json:async()=>({error:'not found'})});
 assert.match(display.innerHTML,/releases/);assert.equal(pre.hidden,true);
});
test('success reveals commands with a validated stable chart version',async()=> {
 const {display,pre,code}=await browser({ok:true,json:async()=>({version:'v1.1.0'})});
 assert.equal(display.textContent,'v1.1.0');assert.equal(code.textContent,'helm install --version 1.1.0');assert.equal(pre.hidden,false);
});
test('a prerelease response is rejected instead of being inserted into commands',async()=> {
 const {display,pre}=await browser({ok:true,json:async()=>({version:'v1.1.0-rc7'})});assert.match(display.innerHTML,/releases/);assert.equal(pre.hidden,true);
});
