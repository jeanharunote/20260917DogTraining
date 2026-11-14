const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/bg.html');await p.screenshot({path:__dirname+'/running_bg.png'});
await p.evaluate(()=>document.body.classList.add('preview'));await p.screenshot({path:__dirname+'/preview.png'});await b.close();})();
