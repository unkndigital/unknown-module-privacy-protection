"use strict";
const support=require("./module-support");
const controls=["acr","voice","telemetry","discovery","logging"];
function create(options){
  options=options||{};const s=options.support||support.create("privacy-protection"),engine=options.engine||require("./runtime/unknown-home-privacy").createEngine();
  function desired(){const current=engine.status();return Object.fromEntries(controls.map(key=>[key,key==="logging"?current.logging:current.controls[key].enabled]));}
  function report(){const r=engine.status();return Object.assign(r,{healthy:!Object.values(r.controls).some(c=>c.enabled&&!c.verified),scope:"Known LG services only; app LAN traffic and domain egress are not blocked"});}
  function apply(settings){for(const control of controls)engine.change({control,enabled:settings[control]===true});}
  async function run(action,args){
    args=args||{};
    if(action==="enable"){s.claim();const old=s.state();if(!old)s.save({desired:desired()});else apply(old.desired);engine.reconcile();s.save({desired:desired(),suspended:false});}
    else if(action==="disable"){s.claim();s.suspend(desired());for(const control of controls.filter(x=>x!=="logging"))engine.change({control,enabled:false});}
    else if(action==="reconcile"||action==="maintenance"){s.claim();const result=engine.reconcile();if(result.errors&&result.errors.length)throw Error(result.errors.map(e=>e.control+": "+e.error).join("; "));}
    else if(action==="setProtection"){if(!controls.includes(args.control)||typeof args.enabled!=="boolean")throw Error("Choose a known protection and a boolean value");engine.change(args);s.save({desired:desired()});}
    else if(action==="viewLog")return engine.logs(false);
    else if(action==="clearLog")return engine.logs(true);
    else if(!["status","health"].includes(action))throw Error("Unknown privacy action");
    return report();
  }
  return {run};
}
if(require.main===module)support.main(create);module.exports={create};
