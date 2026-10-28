import * as THREE from 'three';
import {
  createRickshawHoodTexture,
  createShopSignTexture,
  createHighwayGantryTexture,
} from './textures';

// Shared materials and geometries for high performance and zero memory leaks
const materials = {
  chrome: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  }),
  brass: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.1,
  }),
  tire: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.05,
  }),
  rimGold: new THREE.MeshStandardMaterial({
    color: 0xfde047,
    metalness: 0.8,
    roughness: 0.25,
  }),
  seatBlue: new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.45,
    metalness: 0.1,
  }),
  woodFoot: new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.75,
  }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.2,
    roughness: 0.1,
    transparent: true,
    opacity: 0.75,
  }),
  headlight: new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.6,
  }),
  taillight: new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.6,
  }),
  asphalt: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9,
  }),
};

/**
 * Creates a wheel with tire, golden rim, spokes, and hub
 */
function createWheel(radius: number, width: number): THREE.Group {
  const wheel = new THREE.Group();

  // Tire
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 18);
  const tireMesh = new THREE.Mesh(tireGeo, materials.tire);
  tireMesh.rotation.z = Math.PI / 2;
  wheel.add(tireMesh);

  // Rim
  const rimGeo = new THREE.CylinderGeometry(radius * 0.82, radius * 0.82, width + 0.02, 18);
  const rimMesh = new THREE.Mesh(rimGeo, materials.rimGold);
  rimMesh.rotation.z = Math.PI / 2;
  wheel.add(rimMesh);

  // Hub
  const hubGeo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, width + 0.06, 12);
  const hubMesh = new THREE.Mesh(hubGeo, materials.brass);
  hubMesh.rotation.z = Math.PI / 2;
  wheel.add(hubMesh);

  // Spokes
  const spokeCount = 6;
  const spokeGeo = new THREE.CylinderGeometry(0.015, 0.015, radius * 1.6, 6);
  for (let i = 0; i < spokeCount; i++) {
    const spoke = new THREE.Mesh(spokeGeo, materials.rimGold);
    spoke.rotation.x = (i * Math.PI) / spokeCount;
    wheel.add(spoke);
  }

  return wheel;
}

/**
 * Bangladeshi 3D Rickshaw Model (10 distinct parts)
 */
export function createRickshawModel(): {
  group: THREE.Group;
  leftRearWheel: THREE.Group;
  rightRearWheel: THREE.Group;
  frontFork: THREE.Group;
  pullerLegs: THREE.Group;
} {
  const root = new THREE.Group();

  // 1. Frame / Chassis (enamel emerald green)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    metalness: 0.5,
    roughness: 0.3,
  });

  const frameBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
  const leftBar = new THREE.Mesh(frameBarGeo, frameMat);
  leftBar.position.set(-0.45, 0.45, 0);
  leftBar.rotation.x = Math.PI / 2;
  root.add(leftBar);

  const rightBar = new THREE.Mesh(frameBarGeo, frameMat);
  rightBar.position.set(0.45, 0.45, 0);
  rightBar.rotation.x = Math.PI / 2;
  root.add(rightBar);

  const crossBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
  const rearAxleBar = new THREE.Mesh(crossBarGeo, frameMat);
  rearAxleBar.position.set(0, 0.45, -0.7);
  rearAxleBar.rotation.z = Math.PI / 2;
  root.add(rearAxleBar);

  // Main beam connecting rear axle to front steering
  const spineGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
  const spine = new THREE.Mesh(spineGeo, frameMat);
  spine.position.set(0, 0.5, 0.2);
  spine.rotation.x = Math.PI / 2;
  root.add(spine);

  // 2. Wheels
  const wheelRadius = 0.46;
  const wheelWidth = 0.1;

  const leftRearWheel = createWheel(wheelRadius, wheelWidth);
  leftRearWheel.position.set(-0.62, wheelRadius, -0.7);
  root.add(leftRearWheel);

  const rightRearWheel = createWheel(wheelRadius, wheelWidth);
  rightRearWheel.position.set(0.62, wheelRadius, -0.7);
  root.add(rightRearWheel);

  // Front fork & steering wheel
  const frontFork = new THREE.Group();
  frontFork.position.set(0, 0.42, 0.95);

  const frontWheel = createWheel(wheelRadius, wheelWidth);
  frontWheel.position.set(0, 0, 0);
  frontFork.add(frontWheel);

  // Fork blades
  const forkBladeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8);
  const leftBlade = new THREE.Mesh(forkBladeGeo, materials.chrome);
  leftBlade.position.set(-0.1, 0.35, 0);
  frontFork.add(leftBlade);

  const rightBlade = new THREE.Mesh(forkBladeGeo, materials.chrome);
  rightBlade.position.set(0.1, 0.35, 0);
  frontFork.add(rightBlade);

  // Handlebars
  const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);
  const handleBar = new THREE.Mesh(handleGeo, materials.chrome);
  handleBar.position.set(0, 0.78, 0);
  handleBar.rotation.z = Math.PI / 2;
  frontFork.add(handleBar);

  // Handlebar grips
  const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8);
  const leftGrip = new THREE.Mesh(gripGeo, materials.tire);
  leftGrip.position.set(-0.35, 0.78, 0);
  leftGrip.rotation.z = Math.PI / 2;
  frontFork.add(leftGrip);

  const rightGrip = new THREE.Mesh(gripGeo, materials.tire);
  rightGrip.position.set(0.35, 0.78, 0);
  rightGrip.rotation.z = Math.PI / 2;
  frontFork.add(rightGrip);

  // Brass Bell on right handlebar
  const bellGeo = new THREE.SphereGeometry(0.065, 12, 12);
  const bell = new THREE.Mesh(bellGeo, materials.brass);
  bell.position.set(0.24, 0.85, 0.02);
  frontFork.add(bell);

  root.add(frontFork);

  // 3. Wooden Footboard & Passenger Footrest
  const footBoardGeo = new THREE.BoxGeometry(0.96, 0.06, 0.85);
  const footBoard = new THREE.Mesh(footBoardGeo, materials.woodFoot);
  footBoard.position.set(0, 0.48, -0.3);
  root.add(footBoard);

  // 4. Passenger Seat & Backrest
  const seatCushionGeo = new THREE.BoxGeometry(0.98, 0.14, 0.55);
  const seatCushion = new THREE.Mesh(seatCushionGeo, materials.seatBlue);
  seatCushion.position.set(0, 0.68, -0.65);
  root.add(seatCushion);

  const backrestGeo = new THREE.BoxGeometry(0.98, 0.55, 0.1);
  const backrest = new THREE.Mesh(backrestGeo, materials.seatBlue);
  backrest.position.set(0, 0.98, -0.9);
  backrest.rotation.x = -0.15;
  root.add(backrest);

  // 5. Traditional Rickshaw Folk Art Hood / Canopy (Curved dome)
  const hoodTexture = createRickshawHoodTexture();
  const hoodMat = new THREE.MeshStandardMaterial({
    map: hoodTexture,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const hoodGeo = new THREE.CylinderGeometry(0.58, 0.62, 1.05, 18, 1, false, 0, Math.PI);
  const hood = new THREE.Mesh(hoodGeo, hoodMat);
  hood.position.set(0, 1.48, -0.65);
  hood.rotation.z = Math.PI / 2;
  hood.rotation.y = Math.PI;
  root.add(hood);

  // Hood chrome folding struts
  const strutGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.85, 6);
  const leftStrut = new THREE.Mesh(strutGeo, materials.chrome);
  leftStrut.position.set(-0.55, 1.15, -0.65);
  leftStrut.rotation.z = -0.15;
  root.add(leftStrut);

  const rightStrut = new THREE.Mesh(strutGeo, materials.chrome);
  rightStrut.position.set(0.55, 1.15, -0.65);
  rightStrut.rotation.z = 0.15;
  root.add(rightStrut);

  // 6. Rickshaw Puller (Driver Character)
  const pullerGroup = new THREE.Group();
  pullerGroup.position.set(0, 0.65, 0.45);

  // Driver body (cotton vest)
  const vestMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // energetic orange vest
    roughness: 0.6,
  });
  const bodyGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.48, 10);
  const pullerBody = new THREE.Mesh(bodyGeo, vestMat);
  pullerBody.position.set(0, 0.46, 0);
  pullerBody.rotation.x = 0.2; // leaning forward aggressively pedaling
  pullerGroup.add(pullerBody);

  // Gamcha (traditional neck scarf)
  const gamchaMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.7,
  });
  const gamchaGeo = new THREE.TorusGeometry(0.15, 0.04, 8, 16);
  const gamcha = new THREE.Mesh(gamchaGeo, gamchaMat);
  gamcha.position.set(0, 0.68, 0.06);
  gamcha.rotation.x = Math.PI / 2;
  pullerGroup.add(gamcha);

  // Driver head & cap
  const headGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // brown skin tone
    roughness: 0.7,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 0.82, 0.12);
  pullerGroup.add(head);

  // Cap / Gamcha wrap on head
  const capGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.1, 12);
  const cap = new THREE.Mesh(capGeo, gamchaMat);
  cap.position.set(0, 0.89, 0.12);
  pullerGroup.add(cap);

  // Driver legs (lungi)
  const lungiMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // blue lungi
    roughness: 0.75,
  });
  const pullerLegs = new THREE.Group();
  const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8);
  const leftLeg = new THREE.Mesh(legGeo, lungiMat);
  leftLeg.position.set(-0.12, 0.16, 0);
  leftLeg.rotation.x = -0.3;
  pullerLegs.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, lungiMat);
  rightLeg.position.set(0.12, 0.16, 0);
  rightLeg.rotation.x = 0.3;
  pullerLegs.add(rightLeg);
  pullerGroup.add(pullerLegs);

  // Driver arms reaching handlebar
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  const leftArm = new THREE.Mesh(armGeo, headMat);
  leftArm.position.set(-0.24, 0.58, 0.24);
  leftArm.rotation.x = 0.9;
  leftArm.rotation.z = -0.2;
  pullerGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, headMat);
  rightArm.position.set(0.24, 0.58, 0.24);
  rightArm.rotation.x = 0.9;
  rightArm.rotation.z = 0.2;
  pullerGroup.add(rightArm);

  root.add(pullerGroup);

  // Set pivot grounded
  root.position.y = 0;

  return {
    group: root,
    leftRearWheel,
    rightRearWheel,
    frontFork,
    pullerLegs,
  };
}

/**
 * Dhaka Local Bus 3D Model (Multi-part procedural group)
 */
export function createBusModel(bodyColor = 0xef4444): THREE.Group {
  const bus = new THREE.Group();

  // 1. Bus main body
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.3,
    metalness: 0.2,
  });
  const bodyGeo = new THREE.BoxGeometry(2.1, 1.8, 6.2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.35, 0);
  bus.add(body);

  // 2. Windshield & side windows (continuous strip)
  const windowGeo = new THREE.BoxGeometry(2.14, 0.7, 5.8);
  const windows = new THREE.Mesh(windowGeo, materials.glass);
  windows.position.set(0, 1.65, 0);
  bus.add(windows);

  // 3. Roof luggage rack
  const rackBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.8, 8);
  const leftRack = new THREE.Mesh(rackBarGeo, materials.chrome);
  leftRack.position.set(-0.75, 2.38, -0.2);
  leftRack.rotation.x = Math.PI / 2;
  bus.add(leftRack);

  const rightRack = new THREE.Mesh(rackBarGeo, materials.chrome);
  rightRack.position.set(0.75, 2.38, -0.2);
  rightRack.rotation.x = Math.PI / 2;
  bus.add(rightRack);

  // Roof luggage boxes
  const luggageMat1 = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
  const luggageMat2 = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
  const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.9), luggageMat1);
  box1.position.set(-0.25, 2.5, -0.6);
  bus.add(box1);

  const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.8), luggageMat2);
  box2.position.set(0.3, 2.52, 0.5);
  bus.add(box2);

  // 4. Front & Rear Bumpers
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.3, 0.25), bumperMat);
  frontBumper.position.set(0, 0.6, 3.15);
  bus.add(frontBumper);

  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.3, 0.25), bumperMat);
  rearBumper.position.set(0, 0.6, -3.15);
  bus.add(rearBumper);

  // 5. Headlights & Taillights
  const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  const leftHl = new THREE.Mesh(hlGeo, materials.headlight);
  leftHl.position.set(-0.75, 0.9, 3.12);
  leftHl.rotation.x = Math.PI / 2;
  bus.add(leftHl);

  const rightHl = new THREE.Mesh(hlGeo, materials.headlight);
  rightHl.position.set(0.75, 0.9, 3.12);
  rightHl.rotation.x = Math.PI / 2;
  bus.add(rightHl);

  const leftTl = new THREE.Mesh(hlGeo, materials.taillight);
  leftTl.position.set(-0.75, 0.9, -3.12);
  leftTl.rotation.x = Math.PI / 2;
  bus.add(leftTl);

  const rightTl = new THREE.Mesh(hlGeo, materials.taillight);
  rightTl.position.set(0.75, 0.9, -3.12);
  rightTl.rotation.x = Math.PI / 2;
  bus.add(rightTl);

  // 6. Wheels (4 heavy bus wheels)
  const wheelR = 0.45;
  const wheelW = 0.25;
  const positions = [
    [-1.02, 1.8],
    [1.02, 1.8],
    [-1.02, -1.8],
    [1.02, -1.8],
  ];
  positions.forEach(([x, z]) => {
    const w = createWheel(wheelR, wheelW);
    w.position.set(x, wheelR, z);
    bus.add(w);
  });

  return bus;
}

/**
 * Bangladeshi Decorated Cargo Truck 3D Model
 */
export function createTruckModel(color = 0x0284c7): THREE.Group {
  const truck = new THREE.Group();

  // 1. Cabin
  const cabMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.2,
  });
  const cabGeo = new THREE.BoxGeometry(2.0, 1.9, 1.8);
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 1.45, 1.8);
  truck.add(cab);

  // Cabin windshield
  const wsGeo = new THREE.BoxGeometry(1.85, 0.75, 0.1);
  const windshield = new THREE.Mesh(wsGeo, materials.glass);
  windshield.position.set(0, 1.7, 2.72);
  truck.add(windshield);

  // 2. High Wooden Cargo Bed (Traditional hand-painted bed)
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.8,
  });
  const bedGeo = new THREE.BoxGeometry(2.1, 1.6, 3.8);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.set(0, 1.5, -1.1);
  truck.add(bed);

  // Vertical exhaust pipe
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8);
  const exhaust = new THREE.Mesh(exhaustGeo, materials.chrome);
  exhaust.position.set(0.95, 2.1, 0.8);
  truck.add(exhaust);

  // 3. Headlights & Grille
  const hlGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12);
  const leftHl = new THREE.Mesh(hlGeo, materials.headlight);
  leftHl.position.set(-0.7, 0.85, 2.72);
  leftHl.rotation.x = Math.PI / 2;
  truck.add(leftHl);

  const rightHl = new THREE.Mesh(hlGeo, materials.headlight);
  rightHl.position.set(0.7, 0.85, 2.72);
  rightHl.rotation.x = Math.PI / 2;
  truck.add(rightHl);

  // 4. Heavy wheels
  const wheelR = 0.5;
  const wheelW = 0.28;
  const positions = [
    [-1.02, 1.8],
    [1.02, 1.8],
    [-1.02, -1.3],
    [1.02, -1.3],
    [-1.02, -2.4],
    [1.02, -2.4],
  ];
  positions.forEach(([x, z]) => {
    const w = createWheel(wheelR, wheelW);
    w.position.set(x, wheelR, z);
    truck.add(w);
  });

  return truck;
}

/**
 * Compact Cartoon Sedan / Taxi Model
 */
export function createCarModel(color = 0xf59e0b): THREE.Group {
  const car = new THREE.Group();

  const carMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.25,
    metalness: 0.3,
  });

  // Lower chassis
  const baseGeo = new THREE.BoxGeometry(1.6, 0.65, 3.5);
  const base = new THREE.Mesh(baseGeo, carMat);
  base.position.set(0, 0.6, 0);
  car.add(base);

  // Upper cabin
  const topGeo = new THREE.BoxGeometry(1.35, 0.65, 1.8);
  const top = new THREE.Mesh(topGeo, carMat);
  top.position.set(0, 1.15, -0.2);
  car.add(top);

  // Windows
  const winGeo = new THREE.BoxGeometry(1.38, 0.52, 1.7);
  const win = new THREE.Mesh(winGeo, materials.glass);
  win.position.set(0, 1.15, -0.2);
  car.add(win);

  // Headlights
  const hlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10);
  const leftHl = new THREE.Mesh(hlGeo, materials.headlight);
  leftHl.position.set(-0.55, 0.65, 1.76);
  leftHl.rotation.x = Math.PI / 2;
  car.add(leftHl);

  const rightHl = new THREE.Mesh(hlGeo, materials.headlight);
  rightHl.position.set(0.55, 0.65, 1.76);
  rightHl.rotation.x = Math.PI / 2;
  car.add(rightHl);

  // Taillights
  const leftTl = new THREE.Mesh(hlGeo, materials.taillight);
  leftTl.position.set(-0.55, 0.65, -1.76);
  leftTl.rotation.x = Math.PI / 2;
  car.add(leftTl);

  const rightTl = new THREE.Mesh(hlGeo, materials.taillight);
  rightTl.position.set(0.55, 0.65, -1.76);
  rightTl.rotation.x = Math.PI / 2;
  car.add(rightTl);

  // Wheels
  const wheelR = 0.34;
  const wheelW = 0.18;
  const positions = [
    [-0.8, 1.0],
    [0.8, 1.0],
    [-0.8, -1.0],
    [0.8, -1.0],
  ];
  positions.forEach(([x, z]) => {
    const w = createWheel(wheelR, wheelW);
    w.position.set(x, wheelR, z);
    car.add(w);
  });

  return car;
}

/**
 * Iconic Dhaka Green CNG Auto-Rickshaw (Baby Taxi)
 */
export function createCngModel(): THREE.Group {
  const cng = new THREE.Group();

  // Green lower body
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // dark green
    roughness: 0.35,
    metalness: 0.2,
  });
  const bodyGeo = new THREE.BoxGeometry(1.3, 0.8, 2.2);
  const body = new THREE.Mesh(bodyGeo, greenMat);
  body.position.set(0, 0.7, 0);
  cng.add(body);

  // Yellow roof hood
  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
  });
  const roofGeo = new THREE.BoxGeometry(1.25, 0.6, 1.6);
  const roof = new THREE.Mesh(roofGeo, yellowMat);
  roof.position.set(0, 1.3, -0.2);
  cng.add(roof);

  // Open mesh door cutout / side guard bars
  const barMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
  for (let z = -0.7; z <= 0.3; z += 0.25) {
    const lb = new THREE.Mesh(barGeo, barMat);
    lb.position.set(-0.64, 1.25, z);
    cng.add(lb);

    const rb = new THREE.Mesh(barGeo, barMat);
    rb.position.set(0.64, 1.25, z);
    cng.add(rb);
  }

  // Front single headlight
  const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12);
  const hl = new THREE.Mesh(hlGeo, materials.headlight);
  hl.position.set(0, 0.75, 1.12);
  hl.rotation.x = Math.PI / 2;
  cng.add(hl);

  // 3 Wheels (1 front, 2 rear)
  const wheelR = 0.3;
  const wheelW = 0.14;

  const fw = createWheel(wheelR, wheelW);
  fw.position.set(0, wheelR, 0.85);
  cng.add(fw);

  const lrw = createWheel(wheelR, wheelW);
  lrw.position.set(-0.65, wheelR, -0.7);
  cng.add(lrw);

  const rrw = createWheel(wheelR, wheelW);
  rrw.position.set(0.65, wheelR, -0.7);
  cng.add(rrw);

  return cng;
}

/**
 * Highway Police Patrol Car with Flashing Emergency Beacon Lights
 */
export function createPoliceModel(): {
  group: THREE.Group;
  sirenRed: THREE.Mesh;
  sirenBlue: THREE.Mesh;
} {
  const police = new THREE.Group();

  // White patrol body with dark navy markings
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.2,
  });
  const bodyGeo = new THREE.BoxGeometry(1.65, 0.68, 3.6);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 0.65, 0);
  police.add(body);

  // Police navy blue stripes on side
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
  const stripeGeo = new THREE.BoxGeometry(1.68, 0.2, 3.4);
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.65, 0);
  police.add(stripe);

  // Cabin
  const topGeo = new THREE.BoxGeometry(1.38, 0.65, 1.9);
  const top = new THREE.Mesh(topGeo, bodyMat);
  top.position.set(0, 1.2, -0.2);
  police.add(top);

  // Windows
  const winGeo = new THREE.BoxGeometry(1.4, 0.52, 1.8);
  const win = new THREE.Mesh(winGeo, materials.glass);
  win.position.set(0, 1.2, -0.2);
  police.add(win);

  // Rooftop Emergency Siren Light Bar
  const sirenBarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.2), sirenBarMat);
  bar.position.set(0, 1.58, -0.2);
  police.add(bar);

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.8,
  });
  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.8,
  });

  const sirenGeo = new THREE.BoxGeometry(0.3, 0.16, 0.18);
  const sirenRed = new THREE.Mesh(sirenGeo, redMat);
  sirenRed.position.set(-0.25, 1.68, -0.2);
  police.add(sirenRed);

  const sirenBlue = new THREE.Mesh(sirenGeo, blueMat);
  sirenBlue.position.set(0.25, 1.68, -0.2);
  police.add(sirenBlue);

  // Wheels
  const wheelR = 0.35;
  const wheelW = 0.2;
  const positions = [
    [-0.82, 1.05],
    [0.82, 1.05],
    [-0.82, -1.05],
    [0.82, -1.05],
  ];
  positions.forEach(([x, z]) => {
    const w = createWheel(wheelR, wheelW);
    w.position.set(x, wheelR, z);
    police.add(w);
  });

  return {
    group: police,
    sirenRed,
    sirenBlue,
  };
}

/**
 * Passenger Character Model with Animated Waving Hand
 */
export function createPassengerModel(clothColor = 0xec4899): {
  group: THREE.Group;
  arm: THREE.Mesh;
} {
  const pGroup = new THREE.Group();

  // Torso
  const torsoMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.6 });
  const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.65, 10);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.set(0, 0.72, 0);
  pGroup.add(torso);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.1, 0.25, 0);
  pGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.1, 0.25, 0);
  pGroup.add(rightLeg);

  // Head
  const headGeo = new THREE.SphereGeometry(0.15, 12, 12);
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.15, 0);
  pGroup.add(head);

  // Waving Hand
  const armGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.45, 8);
  const arm = new THREE.Mesh(armGeo, skinMat);
  arm.position.set(0.28, 1.1, 0);
  arm.rotation.z = -0.9;
  pGroup.add(arm);

  return {
    group: pGroup,
    arm,
  };
}

/**
 * Golden Destination Beacon Beam
 */
export function createDestinationBeacon(): THREE.Group {
  const beacon = new THREE.Group();

  // Ground pulsating target circle
  const ringGeo = new THREE.RingGeometry(0.8, 1.6, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  beacon.add(ring);

  // Vertical light pillar cylinder
  const cylinderGeo = new THREE.CylinderGeometry(0.7, 0.9, 8, 16, 1, true);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const pillar = new THREE.Mesh(cylinderGeo, pillarMat);
  pillar.position.y = 4;
  beacon.add(pillar);

  // Top floating gem diamond
  const gemGeo = new THREE.OctahedronGeometry(0.65, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.2,
  });
  const gem = new THREE.Mesh(gemGeo, gemMat);
  gem.position.y = 4.2;
  gem.name = 'beacon_gem';
  beacon.add(gem);

  return beacon;
}

/**
 * Bangladeshi Tea Stall ("টং দোকান") with Bench and Kettle
 */
export function createTeaStallModel(): THREE.Group {
  const stall = new THREE.Group();

  // Wooden counter
  const counterGeo = new THREE.BoxGeometry(2.2, 0.9, 1.2);
  const counter = new THREE.Mesh(counterGeo, materials.woodFoot);
  counter.position.set(0, 0.45, 0);
  stall.add(counter);

  // Tin roof with 4 corner posts
  const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6);
  const posts = [
    [-1.0, -0.55],
    [1.0, -0.55],
    [-1.0, 0.55],
    [1.0, 0.55],
  ];
  posts.forEach(([x, z]) => {
    const p = new THREE.Mesh(postGeo, materials.woodFoot);
    p.position.set(x, 1.1, z);
    stall.add(p);
  });

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.4 });
  const roofGeo = new THREE.BoxGeometry(2.6, 0.1, 1.6);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 2.2, 0);
  roof.rotation.x = 0.1;
  stall.add(roof);

  // Signboard: "মামার স্পেশাল চা"
  const signTexture = createShopSignTexture('মামার স্পেশাল চা', "Mama's Special Tea", '#047857');
  const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), signMat);
  sign.position.set(0, 2.05, 0.81);
  stall.add(sign);

  // Big tea kettle on counter
  const kettleGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.35, 12);
  const kettle = new THREE.Mesh(kettleGeo, materials.chrome);
  kettle.position.set(0.5, 1.05, 0);
  stall.add(kettle);

  // Wooden roadside bench
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.45), materials.woodFoot);
  bench.position.set(0, 0.2, 1.4);
  stall.add(bench);

  return stall;
}

/**
 * Tropical Coconut / Palm Tree
 */
export function createPalmTreeModel(): THREE.Group {
  const tree = new THREE.Group();

  // Curved segmented trunk
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.3, 4.5, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(0, 2.25, 0);
  trunk.rotation.z = (Math.random() - 0.5) * 0.15;
  tree.add(trunk);

  // Green palm fronds
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });
  const leafCount = 7;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i * Math.PI * 2) / leafCount;
    const leafGeo = new THREE.PlaneGeometry(0.8, 2.2);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0, 4.4, 0);
    leaf.rotation.y = angle;
    leaf.rotation.x = 0.8;
    tree.add(leaf);
  }

  // Coconuts cluster
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const nutGeo = new THREE.SphereGeometry(0.14, 8, 8);
  for (let i = 0; i < 3; i++) {
    const nut = new THREE.Mesh(nutGeo, coconutMat);
    nut.position.set(Math.cos(i * 2) * 0.2, 4.2, Math.sin(i * 2) * 0.2);
    tree.add(nut);
  }

  return tree;
}

/**
 * Corrugated Tin-Roof Village House
 */
export function createVillageHouseModel(): THREE.Group {
  const house = new THREE.Group();

  // Wall base (warm mud / brick tint)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
  const wallGeo = new THREE.BoxGeometry(3.5, 2.2, 3.2);
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.set(0, 1.1, 0);
  house.add(walls);

  // Door
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
  const doorGeo = new THREE.PlaneGeometry(0.9, 1.6);
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.8, 1.61);
  house.add(door);

  // Windows
  const winMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
  const winGeo = new THREE.PlaneGeometry(0.7, 0.7);
  const leftWin = new THREE.Mesh(winGeo, winMat);
  leftWin.position.set(-1.1, 1.2, 1.61);
  house.add(leftWin);

  const rightWin = new THREE.Mesh(winGeo, winMat);
  rightWin.position.set(1.1, 1.2, 1.61);
  house.add(rightWin);

  // Gable corrugated metal roof
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.5 });
  const roofGeo = new THREE.ConeGeometry(2.8, 1.4, 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 2.8, 0);
  roof.rotation.y = Math.PI / 4;
  house.add(roof);

  return house;
}

/**
 * Overhead Highway Gantry Sign Board
 */
export function createHighwayGantryModel(): THREE.Group {
  const gantry = new THREE.Group();

  const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

  // Two pillar supports spanning over the highway
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 5.5, 8);
  const leftPillar = new THREE.Mesh(pillarGeo, steelMat);
  leftPillar.position.set(-6.5, 2.75, 0);
  gantry.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, steelMat);
  rightPillar.position.set(6.5, 2.75, 0);
  gantry.add(rightPillar);

  // Cross beam
  const crossBeamGeo = new THREE.BoxGeometry(13.5, 0.35, 0.4);
  const crossBeam = new THREE.Mesh(crossBeamGeo, steelMat);
  crossBeam.position.set(0, 5.2, 0);
  gantry.add(crossBeam);

  // Warning Sign Board
  const signTexture = createHighwayGantryTexture();
  const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
  const signGeo = new THREE.PlaneGeometry(7.0, 2.2);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 4.4, 0.22);
  gantry.add(sign);

  return gantry;
}
