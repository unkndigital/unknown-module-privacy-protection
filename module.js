"use strict";
const support=require("./module-support");
const controls=["acr","voice","telemetry","discovery","logging"];
function create(options){
  options=options||{};const s=options.support||support.create("privacy-protection"),engine=options.engine||require("./runtime/unknown-home-privacy").createEngine();
  function desired(){const current=engine.status();return Object.fromEntries(controls.map(key=>[key,key==="logging"?current.logging:current.controls[key].enabled]));}
  function unverified(message){const e=Error(message);e.code="PROTECTION_UNVERIFIED";return e;}
  function report(){
    let r;try{r=engine.status();}catch(e){throw unverified(e.message);}
    const saved=s.state();if(saved&&!saved.suspended)for(const key of controls){if(key==="logging")continue;const c=r.controls[key];if(saved.desired[key]&&!c.enabled){c.enabled=true;c.verified=false;c.state="not-protected";}}
    const healthy=!Object.values(r.controls).some(c=>c.enabled&&!c.verified);
    return Object.assign(r,{healthy,errorCode:healthy?undefined:"PROTECTION_UNVERIFIED",errorText:healthy?undefined:"Requested privacy protection could not be verified",scope:"Known LG services only; app LAN traffic and domain egress are not blocked"});
  }
  function apply(settings){const errors=[];for(const control of controls){try{if(!engine.settings||engine.settings()[control]!==settings[control])engine.change({control,enabled:settings[control]===true});}catch(e){errors.push(control+": "+e.message);}}if(errors.length)throw unverified(errors.join("; "));}
  function maintain(){const saved=s.state(),errors=[];try{if(saved&&!saved.suspended)apply(saved.desired);}catch(e){errors.push(e.message);}try{const r=engine.reconcile();if(r.errors&&r.errors.length)errors.push(r.errors.map(e=>e.control+": "+e.error).join("; "));}catch(e){errors.push(e.message);}if(errors.length)throw unverified(errors.join("; "));}
  async function run(action,args){
    args=args||{};
    if(action==="enable"){s.claim();const old=s.state();s.save({desired:old?old.desired:desired(),suspended:false});maintain();}
    else if(action==="disable"){s.claim();s.suspend(desired());for(const control of controls.filter(x=>x!=="logging"))engine.change({control,enabled:false});}
    else if(action==="reconcile"||action==="maintenance"){s.claim();maintain();}
    else if(action==="setProtection"){if(!controls.includes(args.control)||typeof args.enabled!=="boolean")throw Error("Choose a known protection and a boolean value");const saved=s.state(),requested=saved?saved.desired:desired();requested[args.control]=args.enabled;s.save({desired:requested,suspended:false});try{engine.change(args);}catch(e){throw unverified(e.message);}}
    else if(action==="viewLog")return engine.logs(false);
    else if(action==="clearLog")return engine.logs(true);
    else if(!["status","health"].includes(action))throw Error("Unknown privacy action");
    return report();
  }
  return {run};
}
if(require.main===module)support.main(create);module.exports={create};
