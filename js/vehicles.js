/**
 * NEON BIKE RIDE — Bike Database
 * Hostable web-game motorcycle catalog. All selectable machines are fictional
 * superbikes/power bikes with exactly two wheels. Old CITY DRIVE IDs are kept
 * only for save compatibility.
 */

export const VEHICLE_TIERS = {
  STARTER: 'Starter',
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  PREMIUM: 'Premium',
  ELITE: 'Elite'
};

export const VEHICLE_TYPES = {
  CAR: 'car',
  SUV: 'suv',
  MOTORCYCLE: 'motorcycle',
  COMMERCIAL: 'commercial'
};

export const VEHICLES = [
  {
    id: 'metro_s', name: 'Predator RR', manufacturer: 'Ethan Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.STARTER, price: 0,
    topSpeed: 188, acceleration: 4.3, handling: 84, braking: 82, weight: 228, grip: 0.89, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.4, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 1,
    color: 0x111827, secondaryColor: 0x00d4ff, description: 'Starter superbike with sharp twin LED eyes, wide fairing, central ram-air nose and stable handling.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'urban_lx', name: 'Falcon ZX 750', manufacturer: 'Ethan Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.BEGINNER, price: 18500,
    topSpeed: 205, acceleration: 4.0, handling: 86, braking: 84, weight: 214, grip: 0.89, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.3, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 2,
    color: 0x0f172a, secondaryColor: 0xf43f5e, description: 'Light sport bike for city sprints and coastal routes.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'falcon_sport', name: 'Apex RR 1000', manufacturer: 'Nova Performance', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.ADVANCED, price: 48500,
    topSpeed: 285, acceleration: 3.0, handling: 91, braking: 90, weight: 202, grip: 0.92, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.2, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 3,
    color: 0xdc2626, secondaryColor: 0x111827, description: 'Aggressive litre-class power bike with aero winglets and explosive acceleration.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'titan_muscle', name: 'Thunder R9', manufacturer: 'Nova Performance', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.PREMIUM, price: 62000,
    topSpeed: 270, acceleration: 3.2, handling: 87, braking: 88, weight: 218, grip: 0.89, offroad: 22,
    fuelCapacity: 32, fuelConsumption: 5.3, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 4,
    color: 0x2563eb, secondaryColor: 0x030712, description: 'Muscular superbike tuned for high-speed highway runs.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'royal_executive', name: 'Phantom GT 1100', manufacturer: 'Crown Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.PREMIUM, price: 89000,
    topSpeed: 255, acceleration: 3.6, handling: 82, braking: 90, weight: 244, grip: 0.89, offroad: 22,
    fuelCapacity: 32, fuelConsumption: 5.6, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 5,
    color: 0x101214, secondaryColor: 0xd4a72c, description: 'Grand touring superbike with smooth power and premium control.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'vortex_x', name: 'Vortex XR 1200', manufacturer: 'Nova Performance', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.ELITE, price: 185000,
    topSpeed: 330, acceleration: 2.5, handling: 96, braking: 95, weight: 198, grip: 0.92, offroad: 22,
    fuelCapacity: 32, fuelConsumption: 5.1, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 10,
    color: 0xe11d48, secondaryColor: 0x020617, description: 'Elite hyperbike built for extreme speed, grip and braking.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'city_explorer', name: 'Trailblade RS', manufacturer: 'Atlas Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.INTERMEDIATE, price: 27500,
    topSpeed: 190, acceleration: 4.8, handling: 80, braking: 80, weight: 232, grip: 0.89, offroad: 70,
    fuelCapacity: 28, fuelConsumption: 5.5, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 2,
    color: 0x22c55e, secondaryColor: 0x14532d, description: 'Adventure-sport bike for rough roads, forest trails and scenic routes.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'grand_terrain', name: 'Summit GT 900', manufacturer: 'Atlas Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.ADVANCED, price: 72000,
    topSpeed: 220, acceleration: 4.1, handling: 83, braking: 86, weight: 248, grip: 0.89, offroad: 70,
    fuelCapacity: 28, fuelConsumption: 5.6, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 4,
    color: 0x64748b, secondaryColor: 0x0f172a, description: 'Tall sport-tourer with strong off-road confidence.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'mountain_beast', name: 'Canyon R 850', manufacturer: 'Atlas Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.ADVANCED, price: 58000,
    topSpeed: 210, acceleration: 4.4, handling: 84, braking: 82, weight: 235, grip: 0.89, offroad: 70,
    fuelCapacity: 28, fuelConsumption: 5.5, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 3,
    color: 0x84cc16, secondaryColor: 0x1f2937, description: 'Mountain-road bike tuned for hairpins and rough surfaces.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'street_hawk', name: 'Shadow ZX', manufacturer: 'Ethan Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.BEGINNER, price: 54000,
    topSpeed: 240, acceleration: 3.7, handling: 89, braking: 87, weight: 206, grip: 0.89, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.2, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 3,
    color: 0x111111, secondaryColor: 0x9ca3af, description: 'Blacked-out sport bike with sharp cornering and clean street style.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'thunder_r', name: 'Inferno V4', manufacturer: 'Nova Performance', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.ADVANCED, price: 78000,
    topSpeed: 298, acceleration: 3.1, handling: 92, braking: 91, weight: 204, grip: 0.92, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.2, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 4,
    color: 0xfacc15, secondaryColor: 0x111827, description: 'V4-inspired fictional power bike with responsive racing feel.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'dirt_runner', name: 'Desert RS 800', manufacturer: 'Atlas Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.INTERMEDIATE, price: 36000,
    topSpeed: 198, acceleration: 4.6, handling: 82, braking: 78, weight: 226, grip: 0.89, offroad: 70,
    fuelCapacity: 28, fuelConsumption: 5.4, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 2,
    color: 0xf97316, secondaryColor: 0x431407, description: 'Desert sport-adventure bike built for sandy roads and canyon stages.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'cargo_king', name: 'Courier GT 700', manufacturer: 'Ethan Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.INTERMEDIATE, price: 42000,
    topSpeed: 185, acceleration: 5.1, handling: 78, braking: 76, weight: 240, grip: 0.89, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.6, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 3,
    color: 0x0ea5e9, secondaryColor: 0x082f49, description: 'Reliable mission bike for delivery contracts and long distance jobs.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'city_van', name: 'Metro Rider 650', manufacturer: 'Ethan Moto', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.BEGINNER, price: 30000,
    topSpeed: 178, acceleration: 5.3, handling: 81, braking: 75, weight: 208, grip: 0.89, offroad: 22,
    fuelCapacity: 28, fuelConsumption: 5.2, nitroCapacity: 60, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 2,
    color: 0xf8fafc, secondaryColor: 0x1e293b, description: 'Easy-handling training sport bike for early missions.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  },
  {
    id: 'metro_bus', name: 'Velocity V12R', manufacturer: 'Nova Performance', type: VEHICLE_TYPES.MOTORCYCLE, tier: VEHICLE_TIERS.ELITE, price: 112000,
    topSpeed: 310, acceleration: 2.9, handling: 94, braking: 93, weight: 206, grip: 0.92, offroad: 22,
    fuelCapacity: 32, fuelConsumption: 5.2, nitroCapacity: 90, condition: 100, mileage: 0, resaleFactor: 0.72, requiredLevel: 6,
    color: 0x9ca3af, secondaryColor: 0x111827, description: 'Elite silver superbike with huge top speed and racing brakes.', seats: 1, isMotorcycle: true, twoWheels: true, fourWheels: false, streetTraffic: true
  }
];

export function getVehicleById(id) {
  return VEHICLES.find(v => v.id === id) || null;
}

export function getVehiclesByTier(tier) {
  return VEHICLES.filter(v => v.tier === tier);
}

export function getVehiclesByType(type) {
  return VEHICLES.filter(v => v.type === type);
}

export function makeVehicleUid() {
  return 'bike_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export function cloneVehicle(base, overrides = {}) {
  return {
    ...JSON.parse(JSON.stringify(base)),
    ...overrides,
    vehicleUid: overrides.vehicleUid || makeVehicleUid(),
    vehicleId: base.id,
    vehicleType: base.type,
    isOwned: overrides.isOwned !== false,
    isTestDrive: !!overrides.isTestDrive,
    purchasePrice: overrides.purchasePrice ?? base.price,
    purchaseDate: overrides.purchaseDate || Date.now(),
    currentFuel: overrides.currentFuel ?? base.fuelCapacity,
    currentCondition: overrides.currentCondition ?? base.condition,
    currentMileage: overrides.currentMileage ?? 0,
    upgrades: overrides.upgrades || {
      engine: 0,
      transmission: 0,
      tires: 0,
      brakes: 0,
      suspension: 0,
      nitro: 0,
      fuelSystem: 0
    },
    customization: overrides.customization || {
      primaryColor: base.color,
      secondaryColor: base.secondaryColor,
      wheels: 0,
      tint: 0,
      headlights: 0,
      spoiler: 0,
      underglow: 0
    },
    owned: true,
    favorite: false
  };
}

// NEON BIKE RIDE intentionally disables the old street-car injection bridge.
// The old CITY DRIVE helper can exist on window, but it is never merged into
// this motorcycle-only catalog. Keeping IDs stable preserves old saves while
// the visible game remains bike-only.
