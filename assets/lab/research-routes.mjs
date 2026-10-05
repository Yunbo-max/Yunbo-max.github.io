import { TOUR, pointOnPath, normalize, cross, dot } from './journey-world.mjs?v=20261005-routes';

// Illustrative navigation, not experimental results or a mandatory workflow.
// Source: Yunbo-max/Research_Autopilot @ f58581b51e87c419398ca3a95934c5aaf3ec12c9.
// Bound to node-index.md, state-and-routing.md, rolling-research-batches.md,
// literature-evidence.md, dependency-resource-scheduling.md and research-websites.md.
const step=(module,title,body,next,options={})=>({module,title,body,next,vehicle:'boat',duration:14,...options});
const human=(title,body,next,options={})=>step('P',title,body,next,{nodes:['P04','P05'],kind:'human',...options});
const literature=step('L','Read papers with their code',
  'Read primary 4D papers beside the actual GitHub implementation, supplementary material and benchmark protocol. Keep source versions attached to every explanation.',
  'Continue when the task, implementation and native evaluation are understood together.',{nodes:['L01','L02','L03','L04','L05']});
const design=step('G','Design a decisive experiment',
  'For each candidate, freeze its prediction, strong baselines, necessary controls, native scoring, precision basis, resource cost and stop rules.',
  'Schedule only complete, executable comparisons whose evaluation and resource requirements are resolved.',{vehicle:'car',nodes:['G01','G02','G03','G04','G05']});
const batch=step('E','Run the eight-hour batch',
  'Dispatch independent ready tasks by dependencies and measured resource envelopes. Preserve complete comparisons; a GPU is shared only with qualified memory headroom.',
  'Verify each completed run, continue the agreed queue and checkpoint unfinished approved work for the next window.',{vehicle:'train',nodes:['E03','E05','P04'],kind:'batch'});
const verify=step('E','Verify before interpreting',
  'Check the actual configuration, implementation semantics, baseline and native scorer. Inspect justified parameter sensitivity; an unresolved bug or tuning confound leaves the result pending.',
  'Apply only bounded, already approved repairs inside the batch. Hold direction changes for consolidated human review.',{vehicle:'car',nodes:['E04','E05'],kind:'verification'});
const review=human('Review the whole batch',
  'At eight hours, the researcher reviews verified positives, refuted ideas, mixed findings, pending work and costs together. Unfinished approved work can carry forward unchanged.',
  'The researcher chooses validation, contextual direction review, changed-goal planning or further evidence repair.',{kind:'batch-review'});

export const SCENARIOS=[
  {id:'paper',label:'From question to paper',short:'A complete research route',premise:'An illustrative 4D paper: change a character’s body while preserving the intended motion and scene. Follow a supported branch that the researcher chooses to continue.',steps:[
    step('P','Set the destination',
      'Confirm the research goal, GitHub and Hugging Face destinations, current GPU count and memory, total budget and next review time.',
      'Use the actual resources to plan the work; historical hardware records do not establish today’s capacity.',{nodes:['P01','P02','P03','P04']}),
    step('I','Define the 4D question',
      'What should a large body edit preserve, and what may change? Decide which scientific claim would make the generated dynamic asset useful.',
      'Identify the immediate research decision, contribution type and conditions for continuing or stopping.',{nodes:['I01','I02','I03','I04']}),
    literature,
    step('B','Find a real baseline failure',
      'Inspect published tasks, native evaluation and qualified simple baselines. Separate failed outputs from successful exceptions before explaining the 4D editing gap.',
      'If no existing evaluation measures the exact claim, resolve that gap before proposing an empirical method.',{nodes:['B01','B02','B03','B04','B05']}),
    step('S','Pin models, data and scoring',
      'Inspect the actual data, splits, model versions, official evaluator and comparison budget. Keep development tuning separate from independent confirmation.',
      'Reuse usable published benchmarks and freeze the full run configuration.',{vehicle:'car',nodes:['S01','S02','S03','S04','S05']}),
    step('H','Compare competing explanations',
      'Could the difficulty come from inconsistent guidance, motion correspondence, optimization or an unnecessary constraint? Propose 10–20 justified ideas only after the baseline gap is established.',
      'Check the strongest simple alternative and closest work. Keep only explanations with discriminating predictions.',{nodes:['H01','H02','H03','H04','H05']}),
    step('M','Make the mechanism computable',
      'Turn the chosen explanation into an intervention, mathematical specification and implementable algorithm. Check assumptions, interfaces, complexity and component necessity.',
      'Develop a mechanism only when the important problem, evaluation and substantive difference are defensible.',{vehicle:'car',nodes:['M01','M02','M03','M04','M05']}),
    design,
    step('E','Implement and qualify',
      'Check dependencies, implementation semantics and faithful baselines. Measure timing and peak memory before promising eight-hour throughput.',
      'Admit ready work using its actual dependency graph and qualified resource envelope.',{vehicle:'car',nodes:['E01','E02','E03']}),
    batch,verify,review,
    step('V','Confirm mechanism and scope',
      'On the human-approved positive branch, complete independent comparisons, repetitions, ablations, stronger alternatives, generalization, cost and uncertainty checks.',
      'Writing becomes eligible only when the required evidence and full-validation obligations close.',{vehicle:'train',nodes:['V01','V02','V03','V04','V05','V06'],kind:'validation'}),
    step('W','Write the supported paper',
      'Build the 4D paper around the claim–evidence matrix. Connect motivation, method, experiments and conclusions; propagate changed results through the manuscript.',
      'Use the chosen writing presentation while keeping every material fact and claim aligned with the evidence.',{vehicle:'car',nodes:['W01','W02','W03','W04','W05','W06','W07','W08','W09'],kind:'writing'}),
    step('F','Draw, compile and cross-check',
      'Create editable pipeline figures and identified result plots. Check captions, notation, references, readability and consistency in the compiled manuscript.',
      'Freeze a consistent manuscript and source packet before submission.',{vehicle:'car',nodes:['F01','F02','F03','F04']}),
    step('R','Submit and address reviews',
      'Lock the submission, check reviewer premises against sources and evidence, prioritize justified follow-up comparisons and prepare a point-by-point revision.',
      'A missing comparison can reopen experiments; a claim change also updates the text and figures.',{nodes:['R01','R02','R03','R04','R05']}),
    step('A','Make the work reproducible',
      'Prepare the authorized GitHub release, selected Hugging Face assets, paper versions, reproduction instructions and a consistent release manifest.',
      'Check real artifact versions and reproducibility before reporting a release.',{vehicle:'car',nodes:['A01','A02','A03','A04','A05']}),
    step('C','Show the work to its community',
      'Connect the paper to a project page, a 4D results viewer, talks, posters and communication. Use identified outputs to demonstrate the supported contribution.',
      'Collect reader and reproduction feedback for the next scientific decision.',{nodes:['C01','C02','C03','C04','C05']}),
    step('X','Navigate from new evidence',
      'Inspect new figures, code, logs and counter-explanations. Keep the map and source bindings current, and locate the task that the new evidence actually requires.',
      'Choose the next route with the researcher; a research project can resume from any supported entry.',{nodes:['X01','X02','X03','X04','X05','X06']})
  ]},
  {id:'repair',label:'A result has a bug',short:'Repair evidence, keep the direction open',premise:'Suppose a 4D comparison appears better, but its metric normalization does not match the official evaluator.',steps:[
    batch,
    step('E','Catch the scoring mismatch',
      'Post-run verification finds that the reported score and native scorer use different normalization. The apparent gain has not established a scientific result.',
      'Retain the original run and locate the exact implementation or evaluation fault.',{vehicle:'car',nodes:['E04','B01'],kind:'verification'}),
    step('E','Repair within the frozen scope',
      'Fix the documented scorer mismatch if the repair is already within the approved bounds. Recheck semantics against the official evaluator and retain both versions.',
      'A change to the scientific protocol needs its own branch and human decision; it is not silently treated as the same comparison.',{vehicle:'car',nodes:['E02','E04','G02']}),
    step('E','Rerun the affected comparison',
      'Repeat the affected native comparison with the qualified scorer. Continue unrelated approved tasks and checkpoint any unfinished work when the window closes.',
      'Separate execution completion from verified evidence before interpreting the corrected outputs.',{vehicle:'train',nodes:['E03','E04','E05'],kind:'batch'}),
    review,
    step('V','Confirm the corrected finding',
      'If the researcher chooses to continue, independently confirm the corrected comparison and update its claim–evidence obligations.',
      'If implementation, parameters or scoring remain unresolved, keep the finding pending and return to evidence repair.',{vehicle:'train',nodes:['V01','V02','V06'],kind:'validation'})
  ]},
  {id:'rethink',label:'The direction needs review',short:'Converge from verified results',premise:'Suppose the batch contains two useful candidates, twelve refuted ones and six mixed findings. These counts are an example, not measured results.',steps:[
    verify,
    human('Review positives, failures and mixed cases',
      'At the batch boundary, compare each idea’s verified evidence, costs and remaining uncertainty. One failed idea does not refute the entire research direction.',
      'The researcher can deepen positives, stop refuted ideas and group mixed findings into a few causes.',{kind:'batch-review'}),
    literature,
    step('B','Revisit the remaining failure',
      'Preserve earlier evidence and ask what the strongest simple baseline still cannot do. Recheck benchmark coverage and the important parent problem.',
      'Investigate competing causes for mixed effects rather than assuming parameter tuning will rescue the method.',{nodes:['B01','B02','B03','B04']}),
    step('H','Converge to a few explanations',
      'After the human chooses reassessment, use the renewed paper–code–benchmark review to revise competing explanations. Later rounds may focus on 2–5, then 1–2 ideas when evidence supports it.',
      'Expand only for a named new uncertainty or changed human requirements; keep no more than twenty active ideas.',{nodes:['H01','H02','H03','H04','H05']}),
    design,
    batch,verify,
    human('Choose the next branch together',
      'Review the complete next-window packet. Carry valid unfinished work forward, confirm useful evidence, stop a refuted direction or authorize a new design.',
      'Do not replenish the first-round slate automatically or write a paper from an incomplete comparison.',{kind:'batch-review'})
  ]},
  {id:'replan',label:'Goals or GPUs change',short:'Return to the human brief',premise:'Suppose the researcher changes the 4D editing goal, adds GPU capacity or chooses a different review time.',steps:[
    human('Discuss the changed brief',
      'Return to the researcher when the goal, success criterion, GPU capacity, budget or review time changes. Reuse every unchanged field.',
      'Update the purpose or resource brief before changing the affected plan.',{nodes:['P01','P04'],kind:'human'}),
    step('I','Check what the change affects',
      'More GPUs change throughput, while a different preservation requirement may change the claim, benchmark eligibility and stopping conditions.',
      'Reopen only affected scientific dependencies; additional capacity alone does not establish scientific validity.',{nodes:['I01','I04']}),
    step('G','Resize complete comparisons',
      'Plan the approved work using measured runtime, peak memory, scoring, verification and saving costs. Preserve the whole experimental comparison when allocating the window.',
      'Separate agent concurrency from GPU-job concurrency and preserve total compute and spending limits.',{vehicle:'car',nodes:['G01','G02','P04']}),
    step('E','Schedule independent ready tasks',
      'Use the real task DAG and resource envelopes to dispatch ready subagents or jobs. A shared card requires qualified peak VRAM, headroom and an implemented admission mechanism.',
      'Keep dependent tasks queued until their inputs and resources are ready.',{vehicle:'train',nodes:['E03','P04'],kind:'batch'}),
    verify,
    human('Carry unfinished work forward',
      'At the window boundary, save stable task IDs, completed units, pending comparisons and legal checkpoints. Continue unchanged approved work in the next eight-hour window.',
      'A new window does not reset the protocol, confirmation history or cumulative budget.',{kind:'batch-review'})
  ]},
  {id:'review',label:'A reviewer asks for evidence',short:'Return from the paper to the experiment',premise:'Suppose a reviewer asks whether the 4D improvement comes from the proposed mechanism or simply more optimization.',steps:[
    step('R','Check the reviewer’s premise',
      'Link the objection to the exact submitted claim and existing comparisons. Distinguish a missing experiment from a misunderstanding or an unsupported premise.',
      'Read the relevant paper, implementation and evaluator before choosing a follow-up.',{nodes:['R02','R03']}),
    literature,
    step('G','Design the matched-budget control',
      'If the comparison is genuinely missing, freeze a native-evaluation contrast against the strong simple alternative with a matched resource budget.',
      'Authorize and schedule the changed design before executing the follow-up.',{vehicle:'car',nodes:['G01','G02','S04']}),
    batch,verify,review,
    step('V','Reconcile the new evidence',
      'After the human’s batch decision, assess the mechanism claim, matched comparison and uncertainty against the new evidence packet.',
      'Update every affected claim and preserve the earlier evidence version.',{vehicle:'train',nodes:['V01','V03','V06'],kind:'validation'}),
    step('W','Revise the claim and explanation',
      'Propagate the new evidence through the method, experiments, abstract and conclusions. Keep the causal explanation within the supported scope.',
      'Synchronize the revised text with its tables, figures and evidence references.',{vehicle:'car',nodes:['W01','W04','W05','W08'],kind:'writing'}),
    step('F','Update the figures and manuscript',
      'Regenerate affected plots from identified results, revise captions and compile the changed manuscript to check consistency.',
      'Only current, consistent text and figures enter the response packet.',{vehicle:'car',nodes:['F02','F03','F04']}),
    step('R','Respond with the actual comparison',
      'Prepare a point-by-point response with the new comparison, source versions and resulting claim changes. Keep decision and resubmission options explicit.',
      'Continue according to the real review outcome and the researcher’s decision.',{nodes:['R04','R05']})
  ]}
];

export const MODULE_LOCATIONS=Object.fromEntries(TOUR.map(leg=>[leg.module,leg.path[0]]));
export const getScenario=id=>{
  const scenario=typeof id==='string'?SCENARIOS.find(s=>s.id===id):id;
  if(!scenario)throw new Error(`Unknown example route: ${id}`);
  return scenario;
};
export const routeDuration=id=>getScenario(id).steps.reduce((n,s)=>n+s.duration,0);
export const researchStepStart=(id,index)=>getScenario(id).steps.slice(0,index).reduce((n,s)=>n+s.duration,0);
export function researchStepPath(id,index){
  const scenario=getScenario(id),origin=MODULE_LOCATIONS[scenario.steps[index].module];
  const destination=MODULE_LOCATIONS[scenario.steps[Math.min(index+1,scenario.steps.length-1)].module];
  if(origin===destination)return [origin,[Math.max(-78,Math.min(78,origin[0]+4)),origin[1]+4],destination];
  return [origin,destination];
}
export function researchStateAt(id,seconds){
  if(!Number.isFinite(seconds))throw new Error('Route time must be finite');
  const scenario=getScenario(id),duration=routeDuration(scenario);
  let time=Math.max(0,Math.min(seconds,duration)),index=0;
  while(index<scenario.steps.length-1&&time>=scenario.steps[index].duration)time-=scenario.steps[index++].duration;
  const current=scenario.steps[index],progress=Math.min(1,time/current.duration),path=researchStepPath(scenario,index);
  const position=pointOnPath(path,progress),before=pointOnPath(path,Math.max(0,progress-.001)),after=pointOnPath(path,Math.min(1,progress+.001));
  const delta=after.map((v,i)=>v-before[i]);
  let tangent=normalize(delta.map((v,i)=>v-dot(delta,position)*position[i]));
  if(Math.hypot(...tangent)<.5)tangent=normalize(cross(position,[0,1,0]));
  return {scenario,step:current,index,progress,path,position,tangent,lat:Math.asin(position[1]),lon:Math.atan2(position[0],position[2]),ended:seconds>=duration};
}

export const vehicleIconWidth=(width,primary=true)=>primary?Math.max(62,Math.min(94,width*.19)):Math.max(38,Math.min(50,width*.11));
export const transportLabel=type=>({boat:'EXPLORE · SAILBOAT',car:'BUILD & REPAIR · CAR',train:'RUN COMPARISONS · TRAIN'}[type]);
