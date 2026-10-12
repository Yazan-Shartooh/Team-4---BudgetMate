import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const root=path.resolve('..'), tmp=path.resolve('.'), out=path.join(root,'presentations');
const SKILL='C:/Users/molha/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
const PY='C:/Users/molha/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/molha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')));
const p=Presentation.create({slideSize:{width:1280,height:720}});
const C={navy:'#05244B',teal:'#008B7B',mint:'#95CFC5',bg:'#F5F7F9',muted:'#607589',dark:'#063730',white:'#FFFFFF',orange:'#BA6B55'};
function text(s,str,x,y,w,h,size=28,color=C.navy,bold=false){
 const sh=s.shapes.add({geometry:'textbox',name:str.slice(0,65),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=str; sh.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0,autoFit:'none',verticalAlignment:'top',wrap:'none'};
 return sh;
}
async function img(s,file,x,y,w,h){
 const b=await fs.readFile(path.join(tmp,'assets',file));
 const m=await sharp(b).metadata();
 h=h??w*m.height/m.width;
 s.images.add({blob:b,contentType:'image/png',alt:file.replace('.png','').replaceAll('-',' '),position:{left:x,top:y,width:w,height:h},fit:'contain'});
 return h;
}
async function brand(s){await img(s,'finora-icon.png',72,45,41,39.34);await img(s,'finora-wordmark.png',125,53,130,32.34);}
function foot(s,n,dark=false,label=''){text(s,label,72,667,1070,22,16,dark?C.mint:C.muted);text(s,String(n).padStart(2,'0'),1172,666,40,24,16,dark?C.mint:C.muted);}
function slide(bg=C.bg){const s=p.slides.add();s.background.fill=bg;return s;}
const source='Project sources: finora-template/README.md, finora-template/src/App.tsx, finora-template/src/data.ts. Original brand artwork: finora-template/public/finora-icon.svg and finora-wordmark.svg.';
const disclosure='Finora prototype. Fictional sample data in USD for October 2026. Screens demonstrate the design template, not completed production screens.';

{
 const s=slide(); await brand(s);
 text(s,'Your money,\nclearly.',72,220,800,205,82,C.navy,true);
 text(s,'Personal finance for everyday life',76,464,760,45,29,C.muted);
 await img(s,'finora-icon.png',863,232,306,294);
 foot(s,1,false,'Team 4   /   Project presentation');
 s.speakerNotes.text='Suggested time: 20 seconds.\nFinora is our personal finance project. It helps people understand the money they earn, the money they spend, and what remains at the end of the month. Today we will show the experience through a simple example.\n'+source+'\nPresentation references: https://www.monarch.com/ and https://www.ynab.com/ (accessed 12 October 2026). These informed the plain-language, benefit-first product narrative. No competitor statistics or features are attributed to Finora.';
}
{
 const s=slide(C.navy);
 text(s,'Where did my\nmoney go?',72,171,785,193,74,C.white,true);
 text(s,'A balance alone cannot explain\nyour spending.',76,400,750,88,31,C.mint);
 text(s,'Small purchases add up',865,220,350,80,27,C.white,true);
 text(s,'Daily spending can be\neasy to lose track of.',865,306,345,77,24,'#B9CBD9');
 text(s,'Limits need context',865,432,350,40,27,C.white,true);
 text(s,'It helps to see what is\nleft in each category.',865,487,345,75,24,'#B9CBD9');
 foot(s,2,true);
 s.speakerNotes.text='Suggested time: 30 seconds.\nThink about payday. Money arrives, then rent, groceries and smaller purchases follow. Looking only at a balance does not tell us which categories used the money or whether we are close to a limit. This is the everyday problem our project addresses. These are problem scenarios, not research statistics.\nSource: README.md project problem statement.';
}
{
 const s=slide();await brand(s);
 text(s,'Your month at a glance',72,142,1136,72,51,C.navy,true);
 text(s,'Income, expenses and what remains in one view.',76,220,1120,40,27,C.muted);
 await img(s,'summary.png',72,313,1136);
 text(s,'$2,386 left this month',76,525,1120,56,39,C.teal,true);
 text(s,'In this example: $5,250 income minus $2,864 expenses.',76,587,1120,37,25,C.muted);
 foot(s,3,false,'Prototype view   /   Fictional October 2026 data in USD');
 s.speakerNotes.text='Suggested time: 35 seconds.\nHere is the starting point in the Finora template. Income is 5,250 dollars, expenses are 2,864 dollars, and the difference is 2,386 dollars. Finora calls that monthly savings. This is a calculated difference in recorded transactions, not a claim about a separate bank savings account.\n'+disclosure+'\n'+source+'\nImplementation status: finora/client/README.md says the integrated Dashboard page is currently a placeholder. This slide presents the intended experience from the working frontend template.';
}
{
 const s=slide();await brand(s);
 text(s,'Every transaction, easy to find',72,140,1136,65,48,C.navy,true);
 text(s,'Record income or spending. Filter by month, type or category.',76,212,1120,42,26,C.muted);
 await img(s,'transactions.png',72,273,1136,365);
 foot(s,4,false,'Prototype view   /   Fictional sample data in USD');
 s.speakerNotes.text='Suggested time: 40 seconds.\nA user adds an income or expense entry with an amount, date and category. The transaction list keeps those entries together, and the filters help find a particular month or kind of spending. Users can edit mistakes or remove an entry. For a live demonstration, add a small food expense and then filter to Food.\n'+disclosure+'\n'+source+'\nCurrent implementation: finora/client/README.md documents connected transaction filters and create, edit and delete dialogs.';
}
{
 const s=slide();await brand(s);
 text(s,'Budget limits with context',72,137,1136,65,50,C.navy,true);
 text(s,'A monthly limit for\neach spending category',76,248,535,90,34,C.navy,true);
 text(s,'Finora shows when spending\nis near a limit or over it.',76,365,530,80,27,C.muted);
 text(s,'$25 over',76,494,530,71,60,C.orange,true);
 text(s,'Entertainment: $225 spent\nagainst a $200 budget.',76,575,530,64,24,C.muted);
 await img(s,'budget-watch.png',690,225,490);
 foot(s,5,false,'Prototype view   /   Fictional sample data in USD');
 s.speakerNotes.text='Suggested time: 40 seconds.\nUsers choose a monthly budget for a category. Finora compares recorded spending with that limit. In the template, under 80 percent is on track, 80 to 100 percent is near the limit, and more than 100 percent is exceeded. Here entertainment spending is 225 dollars against a 200-dollar limit, so the warning explains that it is 25 dollars over. This gives a concrete reason to review the next purchase.\n'+disclosure+'\n'+source+'\nCurrent implementation: budgets and their status displays are connected in the main app. The alert panel shown here comes from the prototype dashboard.';
}
{
 const s=slide();await brand(s);
 text(s,'A monthly report you can understand',72,140,1140,66,44,C.navy,true);
 text(s,'A category breakdown explains where the money went.',76,219,1120,40,27,C.muted);
 await img(s,'report.png',72,282,1136);
 text(s,'Housing accounts for 48.9% of this example’s spending.',76,614,1130,40,26,C.teal,true);
 foot(s,6,false,'Prototype view   /   Fictional October 2026 data in USD');
 s.speakerNotes.text='Suggested time: 35 seconds.\nThe monthly report puts the spending categories in context. In this sample month, housing is the largest category at 1,400 dollars, or 48.9 percent of total spending. That is a description of the example, not advice to change a particular expense. The template also offers Excel export so users can keep a copy of the report.\n'+disclosure+'\n'+source+'\nCurrent implementation: monthly report summary, category breakdown and read-only budgets are connected in the main app. Do not promise template-only features as production features.';
}
{
 const s=slide();await brand(s);
 text(s,'A clearer picture of\neveryday money',72,198,1090,176,70,C.navy,true);
 text(s,'Finora brings spending and monthly budgets\ntogether, so the numbers are easier to understand.',76,412,1110,89,31,C.muted);
 text(s,'Live demo & questions',76,576,1120,58,38,C.teal,true);
 foot(s,7,false,'Team 4');
 s.speakerNotes.text='Suggested time: 20 seconds, then demo or questions.\nOur goal is to make everyday finances easier to understand. The short demo follows one expense: add it to Transactions, check its category budget, then open the Monthly Report.\nIf asked about readiness: the repository documents connected transactions, budgets and monthly reports with a NestJS backend. Dashboard and Income pages are still in progress. The backend keeps changes through browser refreshes but resets when the server restarts. The standalone template resets on browser reload and has no bank connection or authentication.\nSources: finora/client/README.md, api/README.md and finora-template/README.md.';
}
await fs.mkdir(path.join(tmp,'renders'),{recursive:true});
for(const [i,s] of p.slides.items.entries()){
 const png=await p.export({slide:s,format:'png',scale:1.5});
 await fs.writeFile(path.join(tmp,'renders',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
}
const candidate=path.join(tmp,'candidate-3.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
await fs.writeFile(path.join(tmp,'deck.json'),JSON.stringify(p.toProto()));
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(out,'Finora-Project-Presentation-Final.pptx'),pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:7,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(tmp,'validation-final.json')});
const verified=await PresentationFile.importPptx(await FileBlob.load(result.finalPath));
await fs.mkdir(path.join(tmp,'final-renders'),{recursive:true});
for(const [i,s] of verified.slides.items.entries()) {
 const png=await verified.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(tmp,'final-renders',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log(JSON.stringify(result));
