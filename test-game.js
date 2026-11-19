// Headless playtest for From Spark to Startup (index.html).
// Stubs the DOM, loads the game's inline script, then plays full games
// with different strategies / founders / ventures and asserts endings are reached.
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("FAIL: no inline script found"); process.exit(1); }
const js = m[1];

// --- minimal DOM stub ---
function makeCtx() {
  return {
    clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){},
    fillRect(){}, closePath(){}, save(){}, restore(){}, fillText(){},
    strokeStyle:"", fillStyle:"", lineWidth:1,
  };
}
function makeEl() {
  const el = {
    innerHTML:"", textContent:"", value:"", style:{}, dataset:{},
    classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    parentNode:{ insertBefore(){}, appendChild(){} },
    getContext(){ return makeCtx(); },
    addEventListener(){}, appendChild(){}, setAttribute(){},
    querySelectorAll(){ return []; },
  };
  return el;
}
const elements = {};
const documentStub = {
  getElementById(id){ if(!elements[id]) elements[id]=makeEl(); return elements[id]; },
  querySelectorAll(){ return []; },
  createElement(){ return makeEl(); },
  body: makeEl(),
};
const store = {};
const sandbox = {
  console, document: documentStub,
  localStorage:{
    getItem(k){ return k in store ? store[k] : null; },
    setItem(k,v){ store[k]=String(v); },
    removeItem(k){ delete store[k]; },
  },
  location:{ reload(){}, href:"" },
  scrollTo(){},
  setTimeout(){}, clearTimeout(){},
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(js, sandbox, { filename:"game.js" });

const G = sandbox; // top-level game functions live on the sandbox global
let failures = 0;
function assert(cond, msg){ if(!cond){ failures++; console.error("FAIL:", msg); } }
function pickBestOption(ev){
  // pick the option with the most "pos" chips (ties -> first)
  let best=0, bestScore=-1;
  ev.options.forEach((o,i)=>{
    const s=(o.chips||[]).filter(c=>c[1]==="pos").length - (o.chips||[]).filter(c=>c[1]==="neg").length;
    if(s>bestScore){ bestScore=s; best=i; }
  });
  return best;
}
function playGame(founder, venture, policy){
  // fresh state directly (bypasses setup DOM)
  G.sel = { venture, founder, sector:"b2b" };
  G.S = G.freshState(founder, venture, "b2b", "TestCo");
  G.S.prev = { cash:G.S.cash, mrr:0, users:0 };
  G.S.history.push({ cash:G.S.cash, mrr:0, users:0 });
  G.refillQueue(true);
  let weeks=0;
  while(!G.S.ended && G.S.week<=110){
    weeks++;
    // resolve queue events
    const q = G.S.queue.slice();
    for(const ev of q){
      try{
        G.openEvent(ev.id);
        let choice;
        if(policy==="smart-long" && ev.id==="e-acquire-offer") choice=2; // decline, aim for IPO/operate
        else if(policy==="smart" || policy==="smart-long") choice=pickBestOption(ev);
        else choice=Math.floor(Math.random()*ev.options.length);
        G.chooseEvent(ev.id, choice);
      }catch(e){ failures++; console.error("FAIL: event error", ev.id, e.message); }
    }
    // path + raise
    if(policy==="smart" || policy==="smart-long"){
      if(G.S.stage===1 && !G.S.path) G.choosePath(venture==="startup" ? "vc" : "bootstrap");
      if(venture==="startup" && G.S.stage>=2 && !G.S.raise && G.S.path==="vc") G.openRaiseBtn();
      if(G.S.stage===1 && G.S.team.length===0 && G.S.candidates && G.S.candidates.length) {
        try{ G.hireCandidate(0); }catch(e){}
      }
      // focus by stage
      const st=G.S.stage, rw=G.runway();
      let f={ validate:0, build:0, sell:0, hire:0, raise:0, rest:0 };
      if(st===0){ f={ validate:3, build:1, sell:0, hire:0, raise:0, rest:2 }; }
      else if(st===1){ f={ validate:1, build:2, sell:0, hire:2, raise:0, rest:1 }; }
      else if(st===2){ f={ validate:0, build:3, sell:1, hire:0, raise:0, rest:2 }; }
      else if(st===3){ f={ validate:0, build:2, sell:2, hire:0, raise:0, rest:2 }; }
      else { f={ validate:0, build:1, sell:2, hire:1, raise:1, rest:1 }; }
      if(rw<4 && G.S.raise){ f.raise=2; f.sell=1; }
      if(G.S.energy<35){ f.rest=3; f.build=Math.max(0,f.build-1); }
      G.S.focus=f;
      G.S.teamFocus = G.S.product.techDebt>50 ? "quality" : (G.S.churn>8 ? "support" : "ship");
      G.S.marketing = G.S.cash>15000 ? 1000 : 0;
      if(G.S.product.progress>=100){ /* shipped in endWeek */ }
    } else {
      // random policy
      const keys=["validate","build","sell","hire","raise","rest"];
      let f={ validate:0, build:0, sell:0, hire:0, raise:0, rest:0 };
      for(let i=0;i<6;i++) f[keys[Math.floor(Math.random()*6)]]++;
      G.S.focus=f;
      G.S.teamFocus=["ship","quality","support","sales"][Math.floor(Math.random()*4)];
      G.S.marketing=Math.floor(Math.random()*5)*500;
    }
    // long policy: take the IPO when it is actually available
    if(policy==="smart-long" && G.S.entity==="ccorp" && G.mrr()>=40000 && G.S.users>=1500){
      try{ G.exitChoice("ipo"); }catch(e){}
    }
    try{ G.endWeek(); }catch(e){ failures++; console.error("FAIL: endWeek error week", G.S.week, e.stack.split("\n").slice(0,3).join(" | ")); break; }
    // close report modal (stubbed, but keep state clean)
    try{ G.closeReport(); }catch(e){}
  }
  const endTitle = elements["end-title"] ? elements["end-title"].textContent : "";
  return { ended:G.S.ended, week:G.S.week, cash:Math.round(G.S.cash), mrr:G.mrr(), users:G.S.users,
           stage:G.S.stage, founder, venture, policy, ending:endTitle };
}

// --- run the matrix ---
const founders = G.FOUNDERS.map(f=>f.id);
const results=[];
for(const f of founders){
  for(const v of ["startup","steady"]){
    const r = playGame(f, v, "smart");
    results.push(r);
    assert(r.ended, `smart game never ended: ${f}/${v} stopped week ${r.week} stage ${r.stage} cash ${r.cash}`);
    assert(r.week>3, `smart game ended suspiciously early: ${f}/${v} week ${r.week}`);
  }
}
console.log("SMART games:", results.length, "ended:", results.filter(r=>r.ended).length);
const byStage={}; results.forEach(r=>{ byStage[r.stage]=(byStage[r.stage]||0)+1; });
console.log("final stage distribution (smart):", JSON.stringify(byStage));
console.log("weeks (smart): min", Math.min(...results.map(r=>r.week)), "max", Math.max(...results.map(r=>r.week)),
            "median", results.map(r=>r.week).sort((a,b)=>a-b)[Math.floor(results.length/2)]);
console.log("cash at end (smart):", results.map(r=>r.cash).join(", "));
const endings={}; results.forEach(r=>{ endings[r.ending]=(endings[r.ending]||0)+1; });
console.log("endings (smart):", JSON.stringify(endings));
assert(results.every(r=>r.week>=20), "smart runs should last at least ~20 weeks (a real journey, not a sprint)");

// decline-acquisition variant: is IPO / keep-operating reachable?
const long=[];
for(const f of founders){
  for(const v of ["startup","steady"]){
    long.push(playGame(f, v, "smart-long"));
  }
}
const longEnd={}; long.forEach(r=>{ longEnd[r.ending]=(longEnd[r.ending]||0)+1; });
console.log("LONG games (decline acquisition):", long.length, "weeks median",
  long.map(r=>r.week).sort((a,b)=>a-b)[Math.floor(long.length/2)],
  "endings:", JSON.stringify(longEnd));
assert(long.some(r=>/IPO|profitable business/.test(r.ending)), "declining acquisition should sometimes reach IPO or keep-operating");

// random baseline
const rand=[];
for(let i=0;i<24;i++){
  const f=founders[i%founders.length], v=i%2?"steady":"startup";
  rand.push(playGame(f, v, "random"));
}
console.log("RANDOM games:", rand.length, "ended:", rand.filter(r=>r.ended).length);
const smartGood = results.filter(r=>r.stage>=3).length;
const randGood = rand.filter(r=>r.stage>=3).length;
console.log("reached stage 3+ — smart:", smartGood+"/"+results.length, " random:", randGood+"/"+rand.length);
assert(smartGood > randGood, "smart play should beat random play on stage reached");

// spot checks on mechanics
(function(){
  delete store["spark-lesson-v2"]; delete store["spark-save-v2"]; // lesson carry adds +$2k
  G.S = G.freshState("maya","startup","b2b","Mech");
  assert(G.S.cash===18000, "Maya starts with $18k, got "+G.S.cash);
  assert(G.runway()>0, "runway positive at start");
  G.S.validation=3; G.S.interviews=10; G.checkStage();
  assert(G.S.stage===1, "validation gate advances stage 0->1, got "+G.S.stage);
  G.S.team.push({ name:"T", role:"Eng", skill:7, salary:5000 });
  G.choosePath("vc");
  G.checkStage();
  assert(G.S.stage===2, "team+path advances stage 1->2, got "+G.S.stage);
  G.S.product.features=1; G.checkStage();
  assert(G.S.stage===3, "first feature advances stage 2->3, got "+G.S.stage);
  G.S.users=200; G.S.churn=5; G.checkStage();
  assert(G.S.stage===4, "PMF advances stage 3->4, got "+G.S.stage);
  // cap table dilution
  const before=G.S.cap.founder; G.dilute(7,"vc");
  assert(G.S.cap.founder===before-7 && G.S.cap.vc===7, "dilution moves 7% founder->vc");
  // bankruptcy
  G.S.cash=-100; assert(G.checkEndings()===true && G.S.ended, "negative cash ends the game");
})();

if(failures===0) console.log("ALL PLAYTEST CHECKS PASSED");
else { console.log(failures+" FAILURES"); process.exit(1); }
