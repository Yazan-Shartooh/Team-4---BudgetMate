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
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(out,'Finora-Project-Presentation-Final.pptx')));
const originals=[...p.slides.items];
const C={navy:'#05244B',teal:'#008B7B',mint:'#95CFC5',bg:'#F5F7F9',muted:'#607589',white:'#FFFFFF',orange:'#BA6B55'};
function text(s,str,x,y,w,h,size=28,color=C.navy,bold=false){
 const sh=s.shapes.add({geometry:'textbox',name:str.slice(0,65),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=str;sh.text.style={typeface:'Arial',fontSize:size,color,bold,insets:0,autoFit:'none',verticalAlignment:'top',wrap:'none'};return sh;
}
async function img(s,file,x,y,w,h){const b=await fs.readFile(path.join(tmp,'assets',file));const m=await sharp(b).metadata();s.images.add({blob:b,contentType:'image/png',alt:file,position:{left:x,top:y,width:w,height:h??w*m.height/m.width},fit:'contain'});}
async function brand(s){await img(s,'finora-icon.png',72,45,41,39.34);await img(s,'finora-wordmark.png',125,53,130,32.34);}
function foot(s,n,label=''){text(s,label,72,667,1070,22,16,C.muted);text(s,String(n).padStart(2,'0'),1172,666,40,24,16,C.muted);}
function edit(s,name,value){const sh=s.shapes.items.find(x=>x.name===name||x.name.startsWith(name));if(!sh)throw Error('Missing shape '+name);sh.text=value;}
const source='Sources: finora-template/README.md, finora-template/src/App.tsx, finora-template/src/data.ts and finora/client/README.md. Prototype figures are fictional sample data in USD, not measured user outcomes.';

const scenario=p.slides.add();scenario.background.fill=C.bg;await brand(scenario);
text(scenario,'A small overspend can be easy to miss',72,143,1136,67,45,C.navy,true);
text(scenario,'An everyday example: entertainment spending',76,217,1120,40,26,C.muted);
text(scenario,'THE MONTHLY PLAN',76,326,500,35,20,C.muted,true);
text(scenario,'$200',72,368,530,98,80,C.navy,true);
text(scenario,'WHAT WAS SPENT',702,326,500,35,20,C.muted,true);
text(scenario,'$225',698,368,500,98,80,C.orange,true);
text(scenario,'The missing signal: $25 over budget',76,527,1120,56,37,C.orange,true);
text(scenario,'Without a category total, the gap can go unnoticed.',76,590,1120,38,26,C.muted);
foot(scenario,3,'Illustrative scenario   /   Fictional sample data in USD');

const solution=p.slides.add();solution.background.fill=C.bg;await brand(solution);
text(solution,'How Finora solves the problem',72,143,1136,67,49,C.navy,true);
text(solution,'THE EVERYDAY QUESTION',76,259,520,34,19,C.muted,true);
text(solution,'FINORA’S ANSWER',665,259,530,34,19,C.teal,true);
const pairs=[['Where did it go?','One searchable transaction list','Income and spending stay together.'],['Am I over budget?','Category limits with clear status','The amount left or over is visible.'],['How did the month go?','A readable monthly report','Totals and categories explain the month.']];
pairs.forEach((r,i)=>{const y=324+i*105;text(solution,r[0],76,y,545,49,31,C.navy,true);text(solution,r[1],665,y,535,46,29,C.teal,true);text(solution,r[2],665,y+48,535,39,23,C.muted);});
foot(solution,4);

const choice=p.slides.add();choice.background.fill=C.bg;await brand(choice);
text(choice,'Why choose Finora?',72,142,1136,71,54,C.navy,true);
const benefits=[['01','Easy to understand','Clear totals and category labels make the month easier to read.'],['02','You stay in control','Edit entries and adjust category budgets as your plans change.'],['03','Useful for everyday decisions','See remaining budgets before deciding on the next purchase.']];
benefits.forEach((r,i)=>{const y=284+i*106;text(choice,r[0],76,y,75,51,32,C.teal,true);text(choice,r[1],169,y,1000,44,31,C.navy,true);text(choice,r[2],169,y+47,1030,39,24,C.muted);});
text(choice,'For people who want to actively track and review their spending.',76,620,1128,36,24,C.teal);
foot(choice,9);

const ordered=[originals[0],originals[1],scenario,solution,originals[2],originals[3],originals[4],originals[5],choice,originals[6]];
ordered.forEach((s,i)=>s.moveTo(i));
for(const [i,s] of p.slides.items.entries()) {const number=s.shapes.items.find(x=>/^\d{2}$/.test(x.name)&&x.position.left>1100);if(number)number.text=String(i+1).padStart(2,'0');}
edit(originals[4],'Budget limits with context','Am I staying within my budget?');
edit(originals[5],'A monthly report you can understand','What can I learn from this month?');
edit(originals[6],'A clearer picture of\neveryday money','Your spending, understood.\nYour next step, clearer.');
const closingTitle=originals[6].shapes.items.find(x=>x.name==='A clearer picture of\neveryday money');
closingTitle.text.style={typeface:'Arial',fontSize:61,color:C.navy,bold:true,insets:0,autoFit:'none',wrap:'none'};
edit(originals[6],'Finora brings spending','Finora connects each expense to its budget\nand to the bigger picture of your month.');

const narration=[
 ['20 seconds','Finora is our personal finance project. It helps people connect the money they earn and spend with a clear monthly plan. We will start with a familiar problem, show how the app addresses it, and explain who it is useful for.','Let’s start with the question many people ask at the end of the month.'],
 ['35 seconds','A balance tells us how much money remains, but not which purchases used it or whether a category is over its limit. Rent is easy to remember. Smaller purchases can be harder to follow. The result is missing context when we make our next spending decision.','Here is a simple example of how that missing context shows up.'],
 ['35 seconds','Imagine setting 200 dollars aside for entertainment. A concert costs 125 dollars, then dinner and cinema cost another 100. Each purchase has a reason, but together they reach 225 dollars. Without reviewing the category total, it is easy to miss the 25-dollar gap. This is an illustrative scenario based on the prototype’s sample entries.','Finora addresses that gap by connecting records, budgets and the monthly report.'],
 ['35 seconds','Finora answers the three questions directly. The transaction list shows what happened. Category budgets show how spending compares with a chosen limit. The monthly report explains the overall result. The user records the entries, and the app calculates the totals.','First, let’s look at the whole month before looking at individual purchases.'],
 ['35 seconds','In the sample month, recorded income is 5,250 dollars and expenses are 2,864 dollars. Their difference is 2,386 dollars, which the template calls monthly savings. This is the difference between recorded income and expenses, not proof of money held in a separate savings account. The dashboard image shows the intended prototype experience.','That overview depends on the everyday entries behind it.'],
 ['35 seconds','Users record an income or expense with an amount, date and category. The list keeps the entries together. Search and filters help find a transaction by month, type or category. Users can edit an incorrect entry or remove it. This makes it possible to trace a total back to its underlying purchases.','Once the spending is recorded, Finora can compare it with the plan.'],
 ['40 seconds','Return to the entertainment example. The budget is 200 dollars, and recorded spending is 225 dollars. Finora shows Exceeded and states that the category is 25 dollars over. Near-limit status appears from 80 percent through 100 percent, and spending above the limit is exceeded. The app reveals the situation so the user can review the next purchase. It does not guarantee savings or prevent spending.','The next question is what the complete month tells us.'],
 ['35 seconds','The report shows the spending categories for the selected month. Housing is the largest in this fictional example: 1,400 dollars, or 48.9 percent of total spending. This helps the user understand the pattern and review next month’s budget. The totals describe the recorded data and do not prescribe what someone should spend.','These features lead to a practical question: why would someone choose Finora?'],
 ['40 seconds','The reasons are clarity, control and a connection to daily choices. Clear totals and category names make the information easier to follow. Editable entries and budgets let users maintain their own plan. Showing the remaining amount or overspend gives context for the next purchase. Finora is a fit for people who want to actively record and review everyday spending. These are reasons to use this project, not claims that it outperforms every other finance app.','Let’s finish by following one expense through the app.'],
 ['20 seconds, then demo or questions','For the live demonstration, record a food expense, check the category budget, and open the monthly report. That short journey shows how one entry becomes useful context. If asked about readiness, connected transactions, budgets and monthly reports are present in the main app. Dashboard and Income pages remain in progress. The server retains data through browser refresh but resets when it restarts. The standalone design template resets on reload and has no bank connection or authentication.','Thank you. We’re ready for your questions.']
];
ordered.forEach((s,i)=>{const [timing,body,bridge]=narration[i];s.speakerNotes.text=`Suggested time: ${timing}.\n\n${body}\n\nTransition to the next slide: ${bridge}\n\n${source}`;});
const raw=path.join(tmp,'expanded-raw.pptx'),candidate=path.join(tmp,'expanded-with-transitions.pptx');
await (await PresentationFile.exportPptx(p)).save(raw);
console.log(execFileSync(PY,[path.join(tmp,'add-transitions.py'),raw,candidate],{encoding:'utf8'}));
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(out,'Finora-Project-Presentation-Expanded.pptx'),pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:10,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(tmp,'validation-expanded.json')});
const finalDeck=await PresentationFile.importPptx(await FileBlob.load(result.finalPath));
await fs.mkdir(path.join(tmp,'expanded-renders'),{recursive:true});
for(const [i,s] of finalDeck.slides.items.entries()){const png=await finalDeck.export({slide:s,format:'png',scale:1});await fs.writeFile(path.join(tmp,'expanded-renders',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));}
console.log('Saved '+result.finalPath);
