import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
process.on('uncaughtException',error=>{console.error(error.message);process.exit(1);});
const root=path.resolve('..'),tmp=path.resolve('.'),out=path.join(root,'presentations');
const SKILL='C:/Users/molha/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
const PY='C:/Users/molha/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/molha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')));
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(out,'Finora-Project-Presentation-Expanded.pptx')));
const old=[...p.slides.items];
const C={navy:'#05244B',teal:'#008B7B',mint:'#95CFC5',bg:'#F5F7F9',muted:'#607589',white:'#FFFFFF',orange:'#BA6B55'};
function text(s,str,x,y,w,h,size=28,color=C.navy,bold=false){const sh=s.shapes.add({geometry:'textbox',name:str.slice(0,65),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=str;sh.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0,autoFit:'none',verticalAlignment:'top',wrap:'none'};return sh;}
async function img(s,file,x,y,w,h){const b=await fs.readFile(path.join(tmp,'assets',file));const m=await sharp(b).metadata();s.images.add({blob:b,contentType:'image/png',alt:file,position:{left:x,top:y,width:w,height:h??w*m.height/m.width},fit:'contain'});}
async function brand(s){await img(s,'finora-icon.png',72,45,41,39.34);await img(s,'finora-wordmark.png',125,53,130,32.34);}
function find(s,name){const sh=s.shapes.items.find(x=>x.name===name||x.name.startsWith(name));if(!sh)throw Error('Missing shape '+name);return sh;}
function edit(s,name,value,position,size,color){const sh=find(s,name);sh.text=value;if(position)sh.position=position;if(size||color)sh.text.style={...sh.text.style,...(size?{fontSize:size}:{}),...(color?{color}:{})};return sh;}
const source='Project sources: finora-template/README.md, finora-template/src/App.tsx, finora-template/src/data.ts and finora/client/README.md. Screens use fictional prototype data in USD. Finora helps users understand recorded transactions. No bank connection, guaranteed savings, public release or measured customer outcome is claimed.';

edit(old[0],'Your money,','A game plan for\nyour money',{left:72,top:223,width:815,height:197},72);
edit(old[0],'Personal finance for everyday life','Spend with a plan. Know where you stand.',{left:76,top:467,width:1080,height:45},29);
old[0].speakerNotes.text='Suggested time: 20 seconds.\nYou work for your money. Keeping track of it should not feel like a second job. Meet Finora: a personal finance project that connects everyday spending with a monthly plan.\nBridge: But first, a familiar magic trick.\n'+source;

edit(old[1],'Where did my','Payday arrives.\nThen… poof.',{left:72,top:164,width:800,height:204},73);
edit(old[1],'A balance alone','A few small purchases later,\nyou’re investigating your own money.',{left:76,top:405,width:780,height:97},29);
edit(old[1],'Small purchases add up','It all feels small',{left:865,top:220,width:350,height:55},28);
edit(old[1],'Daily spending can be','One coffee. One ride.\nOne more night out.');
edit(old[1],'Limits need context','Then the total hits',{left:865,top:432,width:350,height:48},28);
edit(old[1],'It helps to see','Your balance has a plot twist.\nYour budget wasn’t ready.',{left:865,top:492,width:350,height:86},23);
old[1].speakerNotes.text='Suggested time: 30 seconds.\nPayday arrives and, for a moment, we all feel rich. Then come a coffee, a ride, another night out. Suddenly we are detectives trying to solve the case of our own missing money. The money did not vanish. We lost track of the small decisions behind the total.\nBridge: And the phrase that gets us into trouble? It’s only five dollars.\nThe disappearance and detective language are humorous exaggerations, not factual claims about user losses.\n'+source;

const small=p.slides.add();small.background.fill=C.bg;await brand(small);
text(small,'“It’s only $5” adds up fast',72,142,1136,72,53,C.navy,true);
text(small,'One small extra purchase, repeated every day.',76,223,1120,42,28,C.muted);
text(small,'$5',72,341,320,109,88,C.navy,true);
text(small,'each day',76,458,300,43,27,C.muted);
text(small,'×',383,363,92,70,62,C.muted);
text(small,'30',526,341,260,109,88,C.navy,true);
text(small,'days',530,458,250,43,27,C.muted);
text(small,'=',786,363,92,70,62,C.muted);
text(small,'$150',930,341,282,109,88,C.orange,true);
text(small,'in one month',934,458,282,43,27,C.muted);
text(small,'Small enough to ignore. Big enough to notice later.',76,571,1136,52,32,C.orange,true);
text(small,'Illustrative example   /   $5 per day for 30 days in USD',72,667,1070,22,16,C.muted);
text(small,'03',1172,666,40,24,16,C.muted);
small.speakerNotes.text='Suggested time: 30 seconds.\nFive dollars sounds harmless. Repeat one extra five-dollar purchase for thirty days and the total reaches 150 dollars. This is an illustrative calculation, not a coffee price, customer average or promised saving. The point is how easily the monthly total can hide behind a small daily amount. Finora makes recorded spending visible so the user can decide whether that purchase is worth it.\nBridge: Now imagine that same blind spot inside a monthly budget.\n'+source;

edit(old[2],'A small overspend','Two good nights. One busted budget.',{left:72,top:143,width:1136,height:67},45);
edit(old[2],'An everyday example','The fun was real. So was the overspend.');
edit(old[2],'The missing signal','The plan was $200. The plot twist was $25 over.');
edit(old[2],'Without a category','The purchases made sense. The total needed attention.');
old[2].speakerNotes.text='Suggested time: 30 seconds.\nHere is our fictional entertainment example: 125 dollars for concert tickets, then 100 dollars for dinner and cinema. Two enjoyable nights add up to 225 dollars, but the monthly plan was 200. Nothing mysterious happened. The total simply needed attention.\nBridge: That is exactly the gap Finora is designed to close.\n'+source;

edit(old[3],'How Finora solves','Finora puts the clues in one place');
old[3].speakerNotes.text='Suggested time: 30 seconds.\nFinora connects the everyday questions with clear answers. What did I spend? The transaction list shows the entries. Am I over budget? Category status shows the difference. How did the month go? The report explains the full picture. Users record their spending, and Finora brings those records together.\nBridge: First, the view we all want after payday: where do I stand?\n'+source;

edit(old[8],'Why choose Finora?','Why Finora belongs in your day',{left:72,top:142,width:1136,height:71},49);
edit(old[8],'Easy to understand','Less detective work');
edit(old[8],'Clear totals and category','Find the entry behind the total with search and filters.');
edit(old[8],'You stay in control','More say in your spending');
edit(old[8],'Edit entries and adjust','Set your own limits and see how much room is left.');
edit(old[8],'Useful for everyday','A plan you can keep adjusting');
edit(old[8],'See remaining budgets','Edit an entry, change a budget, and review the month.');
edit(old[8],'For people who want','A small habit today can make next month easier to understand.');
old[8].speakerNotes.text='Suggested time: 35 seconds.\nWhy bring Finora into your day? Because it gives a practical job to the numbers. Search helps you find the purchase behind a total. Budgets make your own limits visible. Editing and monthly review let the plan evolve with your life. You keep the choices. Finora supplies context.\nBridge: So, before we finish, one message from your money.\n'+source;

const closing=old[9];
edit(closing,'A clearer picture of','Your money called.',{left:72,top:186,width:1116,height:91},73);
edit(closing,'Finora brings spending','It wants a game plan.',{left:76,top:294,width:1110,height:79},54,C.muted);
edit(closing,'Live demo & questions','Ready to give it one?',{left:72,top:415,width:1124,height:93},73,C.teal);
text(closing,'Try Finora. Start with your next expense.',76,563,1110,52,32,C.navy,true);
text(closing,'Ask our team to try the demo',76,617,1080,34,23,C.muted);
closing.speakerNotes.text='Suggested time: 25 seconds, then invite the audience to the demo.\nYour money called. It wants a game plan. Pause, smile, and ask: Ready to give it one? Invite the audience to try Finora with one expense, check the category budget, and see the monthly result.\nNo confirmed download or public demo URL was provided. The on-slide invitation directs people to the team demo. If asked about readiness: the main app has connected transactions, budgets and monthly reports. Dashboard and Income pages remain in progress. The standalone template resets on reload, and backend data resets on server restart.\n'+source;

const ordered=[old[0],old[1],small,...old.slice(2)];
ordered.forEach((s,i)=>s.moveTo(i));
for(const [i,s] of p.slides.items.entries()){const number=s.shapes.items.find(x=>/^\d{2}$/.test(x.name)&&x.position.left>1100);if(number)number.text=String(i+1).padStart(2,'0');}
const raw=path.join(tmp,'marketing-raw.pptx'),candidate=path.join(tmp,'marketing-transitions.pptx');
await (await PresentationFile.exportPptx(p)).save(raw);
console.log(execFileSync(PY,[path.join(tmp,'add-transitions.py'),raw,candidate,'11'],{encoding:'utf8'}));
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(out,'Finora-Project-Marketing-Presentation.pptx'),pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:11,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(tmp,'validation-marketing.json')});
const finalDeck=await PresentationFile.importPptx(await FileBlob.load(result.finalPath));
await fs.mkdir(path.join(tmp,'marketing-renders'),{recursive:true});
for(const [i,s] of finalDeck.slides.items.entries()){const png=await finalDeck.export({slide:s,format:'png',scale:1});await fs.writeFile(path.join(tmp,'marketing-renders',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));}
console.log('Saved '+result.finalPath);
