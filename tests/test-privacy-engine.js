"use strict";
const fs=require("fs"),os=require("os"),path=require("path"),assert=require("assert");
const helper=require("../runtime/unknown-home-privacy"),root=fs.mkdtempSync(path.join(os.tmpdir(),"unknown-privacy-inventory-"));
const resolve=p=>path.join(root,p.replace(/^\//,"")),write=(p,v)=>{fs.mkdirSync(path.dirname(resolve(p)),{recursive:true});fs.writeFileSync(resolve(p),v);};
let mounts=[],sequence=0,mode="ok",denials=0;
write("/proc/sys/kernel/random/boot_id","first-boot");write("/proc/self/mountinfo","");
for(const profile of Object.values(helper.PROFILES))for(const name of profile.required.concat(profile.optional))write("/usr/sbin/"+name,Buffer.from([127,69,76,70,1]));
const io=Object.create(fs),relative=p=>"/"+path.relative(root,p).replace(/\\/g,"/");
io.readFileSync=(p,encoding)=>relative(p)==="/proc/self/mountinfo"?mounts.map(m=>m.id+" 1 0:1 / "+m.target+" rw - tmpfs tmpfs rw").join("\n"):fs.readFileSync(p,encoding);
io.readdirSync=p=>relative(p)==="/proc"?["1"]:fs.readdirSync(p);
io.readlinkSync=p=>{if(relative(p)==="/proc/1/exe"){if(mode==="denied"||(mode==="transient"&&denials++<2))throw Object.assign(Error("Fixture read denied"),{code:"EACCES"});if(mode==="gone")throw Object.assign(Error("Fixture process exited"),{code:"ENOENT"});return "/usr/bin/fixture";}return fs.readlinkSync(p);};
io.lstatSync=p=>{const s=fs.lstatSync(p);s.uid=0;s.mode&=~0o022;return s;};
io.statSync=p=>mounts.some(m=>m.target===relative(p))?fs.statSync(resolve("/run/unknown-home-privacy/disabled")):fs.statSync(p);
const engine=helper.createEngine({testing:true,fs:io,resolve,run:(file,args)=>{if(file==="/bin/mount")mounts.push({id:String(++sequence),target:args[2]});if(file==="/bin/umount")mounts=mounts.filter(m=>m.target!==args[0]);return "";}});
try{
  engine.change({control:"acr",enabled:true});engine.change({control:"voice",enabled:true});const before=JSON.stringify(mounts);
  mode="denied";assert.throws(()=>engine.reconcile(),e=>e.code==="PROTECTION_UNVERIFIED"&&/PID 1.*EACCES/.test(e.message));assert.strictEqual(JSON.stringify(mounts),before);assert(engine.settings().acr&&engine.settings().voice);
  mode="transient";denials=0;assert(engine.status().controls.acr.verified);assert.strictEqual(denials,3);
  mode="gone";assert(engine.status().controls.voice.verified);
  mode="ok";mounts=[];write("/proc/sys/kernel/random/boot_id","next-boot");assert(!engine.status().controls.acr.verified);assert(engine.reconcile().controls.acr.verified);assert(engine.status().controls.voice.verified);
  console.log("Privacy inventory: denied reads preserve existing blocks/settings, transient denial retries, exiting processes are handled, and reboot restores requested blocks.");
}finally{assert(path.dirname(root)===path.resolve(os.tmpdir())&&path.basename(root).startsWith("unknown-privacy-inventory-"));fs.rmSync(root,{recursive:true,force:true});}
