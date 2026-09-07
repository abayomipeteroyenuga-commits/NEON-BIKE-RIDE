/**
 * NEON BIKE RIDE — High-detail procedural vehicle meshes.
 * Lightweight, original geometry designed for browser performance.
 */
import * as THREE from 'three';

const mat = (color, roughness=.42, metalness=.35, emissive=0, ei=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: ei });
function mesh(geo, material, x=0,y=0,z=0){ const m=new THREE.Mesh(geo,material); m.position.set(x,y,z); m.castShadow=false; m.receiveShadow=false; return m; }
function box(w,h,d,color,x=0,y=0,z=0, r=.42, metal=.35){ return mesh(new THREE.BoxGeometry(w,h,d),mat(color,r,metal),x,y,z); }
function wheel(g,x,y,z,r=.34,w=.24){
  const tire=mesh(new THREE.TorusGeometry(r,Math.max(.075,r*.22),10,18),mat(0x090b0e,.88,.08));
  tire.rotation.y=Math.PI/2; tire.position.set(x,y,z); tire.name='wheel'; g.add(tire);
  const hub=mesh(new THREE.CylinderGeometry(r*.42,r*.42,w*.75,12),mat(0xc3c8ce,.2,.9),x,y,z); hub.rotation.z=Math.PI/2; g.add(hub);
  const cap=mesh(new THREE.CylinderGeometry(r*.15,r*.15,w*.82,12),mat(0x252a31,.25,.85),x,y,z); cap.rotation.z=Math.PI/2; g.add(cap);
}
function wheels4(g,w,l,r=.34,y=.34){
  // Four clearly visible road wheels: front-left, front-right, rear-left, rear-right.
  // Push them slightly outside the body so none disappear inside the bodywork.
  for(const x of [-w*.53,w*.53]) for(const z of [-l*.34,l*.34]) wheel(g,x,y,z,r,.28);
}
function windows(g,w,l,roofY=1.0){
  const glass=mat(0x101c2b,.12,.72,0x07111d,.25);
  g.add(mesh(new THREE.BoxGeometry(w*.78,.04,l*.42),glass,0,roofY,-.12));
  g.add(mesh(new THREE.BoxGeometry(w*.78,.04,l*.20),glass,0,roofY,.98));
  for(const x of [-w*.43,w*.43]) g.add(mesh(new THREE.BoxGeometry(.035,.28,l*.42),glass,x,roofY,-.08));
}
function lights(g,w,l){
  const head=mat(0xeaf8ff,.12,.55,0x7fd8ff,2.4), tail=mat(0xff1728,.2,.35,0xff0010,1.8);
  for(const x of [-w*.32,w*.32]){ g.add(mesh(new THREE.BoxGeometry(.28,.13,.08),head,x,.63,l*.51)); g.add(mesh(new THREE.BoxGeometry(.25,.11,.07),tail,x,.62,-l*.51)); }
  g.add(mesh(new THREE.BoxGeometry(w*.42,.08,.05),mat(0x090b10,.22,.8),0,.59,l*.515));
  // Strong front-face details so the nose/grille is unmistakable from front and 3/4 views.
  g.add(mesh(new THREE.BoxGeometry(w*.58,.20,.065),mat(0x111820,.24,.78),0,.48,l*.525));
  g.add(mesh(new THREE.BoxGeometry(w*.22,.035,.075),mat(0xaeb7c2,.18,.9),0,.49,l*.535));
}
function mirrors(g,w,z){ for(const x of [-w*.55,w*.55]) g.add(mesh(new THREE.BoxGeometry(.14,.11,.28),mat(0x11151b,.18,.65),x,1.03,z)); }
function aero(g,w,l,c,s,sport=false){
  g.add(box(w*.96,.08,.12,c,0,.48,l*.53,.3,.5));
  if(sport){ g.add(box(w*.72,.10,.35,c,0,.84,-l*.52,.3,.5)); for(const x of [-w*.36,w*.36]) g.add(box(.06,.14,.22,s,x,.78,-l*.5,.3,.5)); }
  g.add(box(.12,.08,l*.58,s,0,.47,0,.25,.65));
}

export function createVehicleMesh(def){
  const g=new THREE.Group(); g.name=def.id;
  const c=def.customization?.primaryColor ?? def.color;
  const s=def.customization?.secondaryColor ?? def.secondaryColor;
  if(def.isMotorcycle) buildMotorcycle(g,def,c,s);
  else if(def.id==='metro_bus') buildSport(g,def,c,s);
  else if(def.id==='city_van'||def.id==='street_van'||def.id==='delivery_van') buildVan(g,def,c,s);
  else if(def.id==='cargo_king'||def.id==='street_pickup'||def.id==='street_offroad_pickup'||def.id==='pickup'||def.id==='offroad_pickup') buildPickup(g,def,c,s);
  else if(def.id==='street_hatch'||def.id==='street_family_hatch'||def.id==='city_hatch'||def.id==='family_hatch') buildHatch(g,def,c,s);
  else if(def.id==='street_mpv'||def.id==='family_mpv') buildMpv(g,def,c,s);
  else if(def.id==='street_taxi'||def.id==='city_taxi') buildTaxi(g,def,c,s);
  else if(def.id==='metro_s' && def.type==='suv') buildGwagon(g,def,c,s);
  else if(def.id==='street_metro'||def.id==='street_exec'||def.id==='metro_sedan'||def.id==='urban_lx'||def.id==='executive_sedan') buildSedan(g,def,c,s);
  else if(def.id==='street_compact_suv'||def.id==='street_urban_suv'||def.id==='street_lux_suv'||def.id==='compact_suv'||def.id==='urban_suv'||def.id==='luxury_suv') buildSuv(g,def,c,s);
  else if(def.type==='suv') buildSuv(g,def,c,s);
  else if(def.id==='vortex_x'||def.id==='falcon_sport'||def.id==='street_hawk'||def.id==='thunder_r'||def.id==='metro_bus') buildSport(g,def,c,s);
  else if(def.id==='titan_muscle') buildMuscle(g,def,c,s);
  else buildSedan(g,def,c,s);
  // Mark only the primary body paint materials. This keeps glass, lights, wheels
  // and chrome from being recolored when the player changes vehicle paint.
  g.traverse(ch => {
    if(ch.isMesh && ch.material && ch.material.color && ch.material.color.getHex() === Number(c)) {
      ch.userData.paintable = true;
    }
  });
  return g;
}

function buildHatch(g,def,c,s){
  const w=1.78,l=3.95;
  g.add(mesh(new THREE.SphereGeometry(1,20,12),mat(c,.31,.48),0,.53,0)).scale.set(w*.62,.29,l*.62);
  g.add(box(w*.94,.32,2.0,s,0,.77,-.18,.25,.55));
  g.add(box(w*.88,.11,.82,c,0,.60,1.28,.25,.55));
  windows(g,w,l,.96); lights(g,w,l); mirrors(g,w,.02); wheels4(g,w,l,.33,.33); aero(g,w,l,c,s,false);
}
function buildMpv(g,def,c,s){
  const w=2.0,l=4.75;
  g.add(box(w,.64,l,c,0,.72,0,.32,.45));
  g.add(box(w*.90,.72,2.35,s,0,1.12,-.20,.30,.45));
  g.add(box(w*.84,.10,.95,c,0,.84,1.45,.22,.55));
  windows(g,w,l,1.18); lights(g,w,l); mirrors(g,w,.08); wheels4(g,w,l,.37,.39); aero(g,w,l,c,s,false);
}
function buildTaxi(g,def,c,s){
  buildSedan(g,def,c,s);
  g.add(box(.55,.10,.34,0xF4F4F4,0,1.35,.05,.12,.2));
  g.add(box(.44,.035,.12,0x222222,0,1.405,.05,.08,.2));
}

function buildSedan(g,def,c,s){
  const w=def.id==='royal_executive'?2.02:1.82,l=def.id==='royal_executive'?4.85:4.35;
  g.add(mesh(new THREE.SphereGeometry(1,20,12),mat(c,.3,.5),0,.55,0)).scale.set(w*.62,.30,l*.62);
  g.add(box(w*.96,.28,l*.55,s,0,.77,-.05,.25,.55));
  g.add(box(w*.90,.12,l*.18,c,0,.58,l*.38,.25,.55));
  windows(g,w,l,.98); lights(g,w,l); mirrors(g,w,.12); wheels4(g,w,l,.34,.34); aero(g,w,l,c,s,false);
}
function buildSport(g,def,c,s){
  const w=1.9,l=4.45;
  g.add(mesh(new THREE.SphereGeometry(1,20,12),mat(c,.24,.58),0,.48,0)).scale.set(w*.66,.27,l*.65);
  g.add(box(w*.92,.28,2.15,s,0,.72,-.12,.22,.62));
  g.add(box(w*.82,.10,1.25,c,0,.60,1.45,.22,.62));
  windows(g,w,l,.88); lights(g,w,l); mirrors(g,w,.0); wheels4(g,w,l,.31,.31); aero(g,w,l,c,s,true);
}
function buildMuscle(g,def,c,s){
  const w=2.0,l=4.65;
  g.add(mesh(new THREE.SphereGeometry(1,20,12),mat(c,.32,.5),0,.58,0)).scale.set(w*.67,.31,l*.64);
  g.add(box(w*.98,.34,1.75,s,0,.86,-.3,.25,.55));
  g.add(box(w*.72,.12,.85,0x16181d,0,.72,1.55,.25,.7));
  windows(g,w,l,.98); lights(g,w,l); mirrors(g,w,.05); wheels4(g,w,l,.37,.37); aero(g,w,l,c,s,true);
}
function buildGwagon(g,def,c,s){
  // Boxy luxury 4x4 silhouette based on the Titan X4 fictional design reference:
  // tall squared cabin, upright front, round lamps, wide stance and rear spare.
  const w=2.22,l=4.72;
  g.add(box(w,.62,l,c,0,.66,0,.18,.5));
  g.add(box(w*.96,.52,1.18,c,0,1.02,1.48,.12,.48)); // upright hood
  g.add(box(w*.94,1.02,2.72,c,0,1.32,-.18,.10,.46)); // tall cabin
  g.add(box(w*.98,.12,2.82,s,0,1.88,-.18,.08,.6)); // flat roof
  const glass=mat(0x0b1824,.10,.78,0x07111d,.22);
  // windshield and rear glass
  const wind=mesh(new THREE.BoxGeometry(w*.82,.055,.72),glass,0,1.48,1.18); wind.rotation.x=-0.12; g.add(wind);
  g.add(mesh(new THREE.BoxGeometry(w*.82,.055,.62),glass,0,1.48,-1.54));
  // large side windows
  for(const x of [-w*.485,w*.485]){
    const side=mesh(new THREE.BoxGeometry(.045,.62,2.02),glass,x,1.48,-.10);
    side.rotation.z=x<0?-0.015:0.015; g.add(side);
  }
  // pillars and roof rails
  for(const x of [-w*.49,w*.49]){ g.add(box(.055,.78,.07,s,x,1.48,.86,.08,.72)); g.add(box(.055,.78,.07,s,x,1.48,-.92,.08,.72)); g.add(box(.06,.08,2.95,s,x,1.96,-.18,.06,.75)); }
  // signature upright front grille
  g.add(box(w*.50,.48,.075,0x111820,0,.91,2.39,.08,.8));
  g.add(box(w*.68,.055,.08,0x5f6972,0,1.16,2.405,.04,.9));
  g.add(box(w*.08,.26,.09,0x5f6972,0,1.02,2.42,.03,.9));
  // round headlights
  const lamp=mat(0xf4fbff,.08,.45,0x8edcff,2.8);
  for(const x of [-w*.34,w*.34]) g.add(mesh(new THREE.CylinderGeometry(.18,.18,.07,20),lamp,x,1.10,2.44).rotateX(Math.PI/2));
  // black bumper and running boards
  g.add(box(w*1.02,.20,.22,0x171b20,0,.53,2.34,.08,.65));
  g.add(box(w*1.02,.18,.20,0x171b20,0,.53,-2.34,.08,.65));
  for(const x of [-w*.56,w*.56]) g.add(box(.12,.10,3.0,0x171b20,x,.58,-.05,.04,.7));
  wheels4(g,w,l,.43,.42);
  // rear-mounted spare wheel, a key Titan X4 visual cue
  const spare=mesh(new THREE.TorusGeometry(.43,.095,12,24),mat(0x090b0e,.88,.10),0,.96,-2.40); spare.rotation.x=Math.PI/2; g.add(spare);
  const hub=mesh(new THREE.CylinderGeometry(.17,.17,.10,16),mat(0x8e969e,.22,.82),0,.96,-2.42); hub.rotation.x=Math.PI/2; g.add(hub);
  // rear light bars
  const tail=mat(0xff1526,.18,.35,0xff0010,1.8);
  for(const x of [-w*.38,w*.38]) g.add(mesh(new THREE.BoxGeometry(.22,.14,.07),tail,x,.88,-2.39));
}

function buildSuv(g,def,c,s){
  const w=def.id==='metro_s'?2.18:2.1,l=def.id==='metro_s'?4.65:4.55,h=def.id==='mountain_beast'?1.16:(def.id==='metro_s'?1.22:1.02),r=def.id==='mountain_beast'?.43:(def.id==='metro_s'?.40:.38);
  g.add(box(w,.58,l,c,0,.68,0,.38,.42));
  g.add(mesh(new THREE.SphereGeometry(1,18,10),mat(s,.34,.42),0,1.13,-.12)).scale.set(w*.60,h*.48,l*.37);
  windows(g,w,l,1.18); lights(g,w,l); mirrors(g,w,.05); wheels4(g,w,l,r,def.id==='mountain_beast'?.45:.40); aero(g,w,l,c,s,false);
  if(def.id==='mountain_beast' || def.id==='metro_s'){ g.add(box(.08,.70,.08,0x2b2d32,w*.56,1.10,0,.3,.75)); g.add(box(.08,.70,.08,0x2b2d32,-w*.56,1.10,0,.3,.75)); if(def.id==='metro_s') g.add(box(w*.70,.08,.08,s,0,1.42,-l*.43,.2,.7)); }
}
function buildPickup(g,def,c,s){
  const w=2.02,l=4.7;
  g.add(box(w,.58,2.25,c,0,.72,.85,.35,.45));
  g.add(mesh(new THREE.SphereGeometry(1,18,10),mat(s,.35,.42),0,1.13,.65)).scale.set(w*.60,.45,.52);
  g.add(box(w*.94,.38,1.9,0x262b31,0,.72,-1.22,.28,.6));
  windows(g,w,2.1,1.2); lights(g,w,l); mirrors(g,w,.75); wheels4(g,w,l,.40,.42);
  g.add(box(w*.72,.10,1.8,s,0,.94,-1.25,.25,.55));
}
function buildVan(g,def,c,s){
  const w=2.05,l=5.05;
  g.add(box(w,1.35,l,c,0,1.0,0,.28,.45));
  g.add(mesh(new THREE.SphereGeometry(1,16,10),mat(s,.28,.45),0,1.45,-.25)).scale.set(w*.58,.50,l*.37);
  g.add(box(w*.88,.55,.75,0x111923,0,1.46,1.72,.22,.65)); lights(g,w,l); mirrors(g,w,.25); wheels4(g,w,l,.36,.38); aero(g,w,l,c,s,false);
}
function buildBus(g,def,c,s){
  const w=2.55,l=10.6;
  g.add(box(w,2.35,l,c,0,1.45,0,.3,.42));
  g.add(box(w*.96,.70,9.6,s,0,1.55,-.1,.22,.5));
  for(const z of [-3.6,-1.2,1.2,3.6]) g.add(box(w*.94,.48,.055,0x111a24,0,1.9,z,.15,.7));
  lights(g,w,l); wheels4(g,w,l,.44,.48);
}
function buildMotorcycle(g,def,c,s){
  // NEON BIKE RIDE superbike model: exactly two tyre assemblies.
  const sport = Number(def.topSpeed||0) >= 250;
  const bodyMat=mat(c,.18,.65,0x07111d,.18);
  const trimMat=mat(s,.26,.7,0x020817,.16);
  const black=mat(0x07090d,.78,.12);
  const metal=mat(0xa1a8b3,.24,.86);
  const glow=mat(0xdff7ff,.08,.35,0x46d9ff,2.8);
  const red=mat(0xff1744,.16,.35,0xff001d,1.8);
  const tyreR = sport ? .46 : .42;
  const tyreTube = sport ? .105 : .095;
  const rearZ=-1.18, frontZ=1.22;
  function wheel(z,name){
    const w=new THREE.Group(); w.name=name; w.userData.neonBikeWheel=true;
    const tyre=mesh(new THREE.TorusGeometry(tyreR,tyreTube,12,24),black); tyre.rotation.y=Math.PI/2; tyre.name=name+'_tyre'; w.add(tyre);
    const rim=mesh(new THREE.TorusGeometry(tyreR*.58,tyreTube*.18,8,18),metal); rim.rotation.y=Math.PI/2; rim.name=name+'_rim'; w.add(rim);
    const hub=mesh(new THREE.CylinderGeometry(.095,.095,.16,14),metal); hub.rotation.z=Math.PI/2; hub.name=name+'_hub'; w.add(hub);
    for(let i=0;i<6;i++){const sp=mesh(new THREE.BoxGeometry(.035,.025,tyreR*.86),metal); sp.rotation.y=i*Math.PI/6; w.add(sp);}
    const disc=mesh(new THREE.CylinderGeometry(tyreR*.38,tyreR*.38,.025,20),mat(0xd6dde7,.12,.92)); disc.rotation.z=Math.PI/2; disc.position.x=.095; disc.name=name+'_brake_disc'; w.add(disc);
    w.position.set(0,tyreR,z); g.add(w); return w;
  }
  const rearWheel = wheel(rearZ,'rear_wheel');
  const frontWheel = wheel(frontZ,'front_wheel');

  g.add(box(.22,.18,2.28,0x101820,0,.72,.02,.18,.7));
  const tank=mesh(new THREE.SphereGeometry(.48,18,12),bodyMat,0,.91,.15); tank.scale.set(.95,.50,1.38); tank.name='wide_fuel_tank'; g.add(tank);
  g.add(box(.54,.18,.86,trimMat,0,.84,-.58,.18,.6));
  g.add(box(.46,.18,.74,bodyMat,0,1.02,-1.08,.22,.6));
  g.add(box(.40,.12,.92,0x101317,0,1.15,-.92,.18,.75));
  g.add(box(.62,.34,.52,0x1c2430,0,.62,-.24,.16,.8));
  g.add(box(.92,.42,.74,bodyMat,0,.92,1.02,.18,.62));
  g.add(box(.72,.22,.48,trimMat,0,1.03,1.38,.12,.7));
  g.add(box(.42,.16,.15,0x030712,0,.98,1.72,.08,.85));
  for(const x of [-.24,.24]) g.add(box(.21,.10,.055,glow,x,1.03,1.77,.04,.25));
  g.add(box(.34,.045,.05,glow,0,.91,1.79,.04,.25));
  for(const x of [-.58,.58]){ const wg=box(.44,.055,.16,bodyMat,x,.85,1.32,.05,.55); wg.rotation.z=x<0?.18:-.18; wg.rotation.y=x<0?-.28:.28; g.add(wg); }
  for(const x of [-.48,.48]){ const wg=box(.36,.045,.13,trimMat,x,.72,1.18,.05,.6); wg.rotation.z=x<0?.1:-.1; wg.rotation.y=x<0?-.22:.22; g.add(wg); }
  for(const x of [-.17,.17]){ const f=box(.045,.95,.045,metal,x,.93,.97,.02,.88); f.rotation.x=.22; g.add(f); }
  for(const x of [-.16,.16]){ const sw=box(.045,.05,1.08,metal,x,.55,-.68,.02,.88); sw.rotation.x=-.08; g.add(sw); }
  g.add(box(.72,.06,.08,metal,0,1.29,.84,.02,.88));
  for(const x of [-.44,.44]) g.add(box(.18,.08,.11,0x07090d,x,1.29,.84,.03,.85));
  const pipe=mesh(new THREE.CylinderGeometry(.055,.07,1.05,10),mat(0x64748b,.2,.8)); pipe.rotation.x=Math.PI/2; pipe.position.set(.36,.55,-.70); g.add(pipe);
  const can=mesh(new THREE.CylinderGeometry(.12,.15,.62,12),mat(0xb7c0cc,.16,.82)); can.rotation.x=Math.PI/2; can.position.set(.48,.68,-1.22); g.add(can);
  g.add(box(.06,.035,1.0,0x151515,-.26,.47,-.63,.02,.6));
  g.add(box(.42,.10,.06,red,0,.94,-1.52,.04,.35));
  g.add(box(.50,.06,.04,0xeeeeee,0,.72,-1.58,.03,.6));
  const suit=mat(0x111827,.45,.35); const helmet=mat(0x0b1220,.25,.7,0x07152b,.12); const visor=mat(0x64dfff,.08,.55,0x00d4ff,.7);
  const torso=mesh(new THREE.BoxGeometry(.42,.52,.28),suit,0,1.55,-.18); torso.rotation.x=.36; g.add(torso);
  const head=mesh(new THREE.SphereGeometry(.22,16,10),helmet,0,1.91,.08); head.scale.set(1.02,.95,1.08); g.add(head);
  g.add(box(.34,.055,.05,visor,0,1.91,.285,.025,.25));
  for(const x of[-.28,.28]){ const arm=box(.10,.46,.10,suit,x,1.43,.33,.06,.45); arm.rotation.x=-.95; arm.rotation.z=x<0?.18:-.18; g.add(arm); }
  for(const x of[-.20,.20]){ const leg=box(.12,.54,.12,suit,x,1.05,-.68,.06,.45); leg.rotation.x=-.62; g.add(leg); const boot=box(.13,.10,.28,0x050505,x,.65,-.96,.04,.7); boot.rotation.x=-.08; g.add(boot); }
  g.userData.neonBikeRide = true;
  g.userData.wheelCount = 2;
  g.userData.primaryWheels = [rearWheel.name, frontWheel.name];
  g.scale.set(1.1,1.08,1.1);
}
