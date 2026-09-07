/**
 * NEON BIKE RIDE — 20-level superbike campaign + rotating daily challenge.
 */
// Unique destination color for every campaign level (map, route, waypoint, tracker).
export const CAMPAIGN_COLORS = [
  0xff4d4d, 0xff8a3d, 0xffc233, 0xd8e43b, 0x76d64b,
  0x28d7a1, 0x20c9d9, 0x2f8cff, 0x5b6dff, 0x8d5cff,
  0xb84dff, 0xe34cff, 0xff4fb3, 0xff5f7a, 0xff6b3d,
  0xffa62b, 0xffd23f, 0xa8d83f, 0x36d98b, 0x00d7ff
];
export function getCampaignColor(level) {
  const n = Math.max(1, Number(level) || 1);
  return CAMPAIGN_COLORS[(n - 1) % CAMPAIGN_COLORS.length];
}

export const CAMPAIGN_MISSIONS = [
  { level: 1, title: 'COASTAL TRAINING RIDE', type: 'drive', objective: 'Ride to Eagle Point checkpoint', dest: 'central_mall', reward: 1200, xp: 100 },
  { level: 2, title: 'COURIER BIKE RUN', type: 'job', objective: 'Complete a bike courier job', job: 'delivery', reward: 1500, xp: 120 },
  { level: 3, title: 'TUNE YOUR BIKE', type: 'upgrade', objective: 'Install your first bike upgrade', reward: 1800, xp: 150 },
  { level: 4, title: 'AIRPORT EXPRESS RIDE', type: 'drive', objective: 'Ride to the terminal route marker', dest: 'airport', reward: 2200, xp: 170 },
  { level: 5, title: 'FIRST CHECKPOINT RACE', type: 'race', objective: 'Pass all neon checkpoints and finish', race: 'street', reward: 3000, xp: 220 },
  { level: 6, title: 'FOOD RIDER SHIFT', type: 'job', objective: 'Complete a food bike delivery', job: 'food', reward: 2800, xp: 200 },
  { level: 7, title: 'BEACHFRONT SPRINT', type: 'drive', objective: 'Ride to the beachfront destination', dest: 'grand_hotel', reward: 3200, xp: 230 },
  { level: 8, title: 'BUY A SECOND BIKE', type: 'buy', objective: 'Buy or unlock another superbike', reward: 3800, xp: 280 },
  { level: 9, title: 'CIRCUIT CONTROL', type: 'race', objective: 'Finish the circuit checkpoint route', race: 'circuit', reward: 4500, xp: 350 },
  { level: 10, title: 'NEON TOWER RIDE', type: 'drive', objective: 'Ride to Neon Tower route marker', dest: 'nova_tower', reward: 5200, xp: 420 },
  { level: 11, title: 'VIP NIGHT RIDE', type: 'job', objective: 'Complete a VIP rider contract', job: 'vip', reward: 5600, xp: 450 },
  { level: 12, title: 'HIGHWAY BLAST', type: 'race', objective: 'Finish the highway sprint', race: 'highway', reward: 6000, xp: 480 },
  { level: 13, title: 'BIKE MARKET VISIT', type: 'drive', objective: 'Reach the Bike Marketplace', dest: 'market', reward: 6500, xp: 500 },
  { level: 14, title: 'CANYON CONTRACT', type: 'job', objective: 'Complete an off-road bike contract', job: 'offroad', reward: 7200, xp: 540 },
  { level: 15, title: 'STADIUM RIDER RUN', type: 'drive', objective: 'Ride to the stadium route marker', dest: 'stadium', reward: 7800, xp: 580 },
  { level: 16, title: 'POWER BIKE MAYHEM', type: 'race', objective: 'Win the power bike race', race: 'street', reward: 8500, xp: 620 },
  { level: 17, title: 'BRIDGE CROSSING', type: 'drive', objective: 'Cross the riverside bridge route', dest: 'bridge', reward: 9000, xp: 680 },
  { level: 18, title: 'RECOVERY RIDER', type: 'job', objective: 'Complete a recovery bike contract', job: 'recovery', reward: 9600, xp: 720 },
  { level: 19, title: 'FINAL TIME TRIAL', type: 'race', objective: 'Finish the final time trial route', race: 'timetrial', reward: 11000, xp: 800 },
  { level: 20, title: 'KING OF NEON BIKE RIDE', type: 'drive', objective: 'Ride to Neon Tower and complete the campaign', dest: 'nova_tower', reward: 20000, xp: 1200 }
];


// Campaign destinations are fixed to road-accessible approach points, not building centers.
// This prevents the GPS from sending the player into a landmark's solid building mesh.
export const CAMPAIGN_DESTINATIONS = {
  1:  { name: 'Eagle Point — NEON BIKE CHECKPOINT', x: -40, z: 30 },
  2:  { name: 'Courier Bay — BIKE PICKUP', x: -80, z: 80 },
  3:  { name: 'Rider Garage — OPEN SERVICE ROAD', x: 40, z: -60 },
  4:  { name: 'Airport Express — ROUTE MARKER', x: -280, z: -80 },
  5:  { name: 'Neon Checkpoint Race — START GRID', x: 0, z: -160 },
  6:  { name: 'Food Rider Hub — PICKUP ROAD', x: -80, z: 80 },
  7:  { name: 'Beachfront Sprint — FINISH MARKER', x: 10, z: 240 },
  8:  { name: 'Bike Marketplace — OPEN ACCESS ROAD', x: -70, z: 10 },
  9:  { name: 'Bike Circuit — Starting Grid', x: -160, z: -160 },
  10: { name: 'Neon Tower — OPEN CITY ROAD', x: 20, z: 10 },
  11: { name: 'VIP Lounge — OPEN PICKUP ROAD', x: 0, z: -80 },
  12: { name: 'Highway Sprint — OPEN HIGHWAY START', x: -240, z: 0 },
  13: { name: 'Bike Marketplace — OPEN ACCESS ROAD', x: -70, z: 10 },
  14: { name: 'Off-Road Center — OPEN DIRT PAD', x: 320, z: -240 },
  15: { name: 'Nova Stadium — OPEN NORTH ROAD', x: 120, z: -40 },
  16: { name: 'Power Bike Race — OPEN START GRID', x: 80, z: 80 },
  17: { name: 'Riverside Bridge — OPEN ROAD ENTRANCE', x: 0, z: 140 },
  18: { name: 'Recovery Yard — OPEN ACCESS ROAD', x: 80, z: -160 },
  19: { name: 'Time Trial — OPEN START GRID', x: -80, z: -160 },
  20: { name: 'Neon Tower — FINAL OPEN CITY ROAD', x: 20, z: 10 }
};

export function getCampaignDestination(level) {
  const d = CAMPAIGN_DESTINATIONS[Number(level)];
  return d ? { ...d } : null;
}

// Multi-stage campaign job routes. Each point is placed on a drivable road
// or designated access road; the player must reach the pickup first and then
// deliver to the final destination. This prevents a campaign 'job' from being
// completed merely by reaching an arbitrary landmark/building.
export const CAMPAIGN_JOB_STAGES = {
  2: {
    pickup: { name: 'Courier Depot — Pickup Bay', x: -80, z: 80 },
    dropoff: { name: 'Downtown Office — OPEN DELIVERY ROAD', x: 80, z: 80 }
  },
  6: {
    pickup: { name: 'Food Rider Hub — PICKUP ROAD', x: -80, z: 80 },
    dropoff: { name: 'Beachfront Restaurant — OPEN DELIVERY ROAD', x: 0, z: 200 }
  },
  11: {
    pickup: { name: 'VIP Lounge — OPEN PICKUP ROAD', x: 0, z: -80 },
    dropoff: { name: 'Grand Hotel — OPEN VIP ROAD', x: 0, z: 200 }
  },
  14: {
    pickup: { name: 'Off-Road Center — OPEN CONTRACT PAD', x: 320, z: -240 },
    dropoff: { name: 'Mountain Recovery Point — OPEN DIRT ROAD', x: 300, z: -80 }
  },
  18: {
    pickup: { name: 'Recovery Yard — OPEN VEHICLE PICKUP', x: 80, z: -160 },
    dropoff: { name: 'Riverside Recovery Drop — OPEN ROAD', x: -280, z: 0 }
  }
};

export function getCampaignJobStages(level) {
  const s = CAMPAIGN_JOB_STAGES[Number(level)];
  return s ? { pickup: { ...s.pickup }, dropoff: { ...s.dropoff } } : null;
}

export const CAMPAIGN_RACE_CHECKPOINTS = {
  5:  [{x:0,z:80},{x:80,z:80},{x:80,z:0},{x:0,z:0},{x:-80,z:0}],
  9:  [{x:-160,z:-160},{x:-80,z:-160},{x:-80,z:-80},{x:0,z:-80},{x:0,z:-160}],
  12: [{x:-280,z:0},{x:-200,z:0},{x:-200,z:-80},{x:-280,z:-80},{x:-280,z:0}],
  16: [{x:80,z:80},{x:160,z:80},{x:160,z:0},{x:80,z:0},{x:80,z:80}],
  19: [{x:-80,z:-160},{x:-80,z:-80},{x:0,z:-80},{x:0,z:-160},{x:-80,z:-160}]
};

export function getCampaignRaceCheckpoints(level) {
  const cps = CAMPAIGN_RACE_CHECKPOINTS[Number(level)];
  return cps ? cps.map(p => ({ ...p })) : null;
}

export function getCampaignMission(level) {
  return CAMPAIGN_MISSIONS.find(m => m.level === level) || null;
}

const DAILY_POOL = [
  { id:'distance', title:'ROAD WARRIOR', text:'Ride 5 km today', target:5, reward:1200, xp:160 },
  { id:'cash', title:'MONEY RUN', text:'Earn $2,500 today', target:2500, reward:1500, xp:180 },
  { id:'districts', title:'ROUTE EXPLORER', text:'Visit 3 different districts', target:3, reward:1400, xp:170 },
  { id:'speed', title:'SPEED RIDER', text:'Reach 160 KM/H', target:160, reward:1300, xp:170 }
];

function dateKey(date = new Date()) { return date.toISOString().slice(0,10); }
function hashDate(key) { let h=0; for (let i=0;i<key.length;i++) h=(h*31+key.charCodeAt(i))>>>0; return h; }
export function getDailyChallenge(date = new Date()) { return DAILY_POOL[hashDate(dateKey(date)) % DAILY_POOL.length]; }
export function getDailyDateKey(date = new Date()) { return dateKey(date); }
