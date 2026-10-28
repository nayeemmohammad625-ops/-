import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GameStats,
  Difficulty,
  PassengerData,
  VehicleData,
  PolicePatrol,
  AngryCrowdMember,
  Particle,
} from '../types/game';
import { LEVEL_CONFIGS, getMaxLivesForDifficulty, getDifficultyFineMultiplier } from './levels';
import {
  createRickshawModel,
  createBusModel,
  createTruckModel,
  createCarModel,
  createCngModel,
  createPoliceModel,
  createPassengerModel,
  createDestinationBeacon,
  createTeaStallModel,
  createPalmTreeModel,
  createVillageHouseModel,
  createHighwayGantryModel,
} from './models';
import {
  createHighwayRoadTexture,
  createVillageRoadTexture,
  createShopSignTexture,
} from './textures';
import { soundManager } from './audio';

// Module-level reusable math helpers to enforce Zero GC in 60fps render loop
const _vec3 = new THREE.Vector3();
const _vec3Target = new THREE.Vector3();

export class RickshawGameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Game state
  public stats: GameStats;
  public difficulty: Difficulty = 'easy';
  public onStatsUpdate?: (stats: GameStats) => void;
  public onGameOver?: (reasonBn: string, reasonEn: string) => void;
  public onLevelCleared?: (level: number, earnings: number) => void;
  public onNotification?: (msgBn: string, msgEn: string, type?: 'info' | 'warn' | 'success') => void;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isInvulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;

  // Player Rickshaw
  private rickshawGroup: THREE.Group;
  private leftRearWheel: THREE.Group;
  private rightRearWheel: THREE.Group;
  private frontFork: THREE.Group;
  private pullerLegs: THREE.Group;
  private playerPos = new THREE.Vector3(0, 0, 0);
  private playerVelocity = 0;
  private playerRotation = 0;
  private pedalPhase = 0;
  private steerAngle = 0;

  // Input states
  private inputs = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  // World entities
  private vehicles: VehicleData[] = [];
  private policeUnits: PolicePatrol[] = [];
  private passengers: PassengerData[] = [];
  private activeBeacon: THREE.Group | null = null;
  private navArrow: THREE.Group | null = null;
  private angryCrowd: AngryCrowdMember[] = [];
  private crowdContainer: THREE.Group;
  private particles: Particle[] = [];
  private particlesMeshGroup: THREE.Group;

  // Camera shake
  private cameraShake = 0;

  // Key tracking
  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onResizeBound: () => void;

  constructor(container: HTMLElement, difficulty: Difficulty = 'easy', startLevel = 1) {
    this.container = container;
    this.difficulty = difficulty;
    this.clock = new THREE.Clock();

    // Load saved highscore and unlocked levels
    let savedHighScore = 0;
    let savedUnlocked = 1;
    try {
      savedHighScore = parseInt(localStorage.getItem('rickshaw_high_score') || '0', 10) || 0;
      savedUnlocked = parseInt(localStorage.getItem('rickshaw_unlocked_level') || '1', 10) || 1;
    } catch {}

    const maxLives = getMaxLivesForDifficulty(difficulty);
    this.stats = {
      money: 0,
      level: startLevel,
      lives: maxLives,
      maxLives,
      passengersServed: 0,
      finesPaid: 0,
      policeSuspicion: 0,
      isOnHighway: false,
      activePassenger: null,
      highScore: savedHighScore,
      unlockedLevels: Math.max(1, savedUnlocked),
    };

    // 1. Detect software WebGL from GPU renderer string
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js WebGLRenderer with PBR directives
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene, Camera & Studio Environment Lighting
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Bangladeshi bright tropical sky
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.007);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.5, 400);
    this.camera.position.set(0, 16, -16);
    this.camera.lookAt(0, 0, 8);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm Key Directional Sunlight
    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    dirLight.position.set(35, 60, -25);
    if (!this.isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 150;
      const d = 40;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);

    // Cool Sky & Ground Hemisphere Fill Light
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x15803d, 0.85);
    this.scene.add(hemiLight);

    // 4. Containers
    this.crowdContainer = new THREE.Group();
    this.scene.add(this.crowdContainer);

    this.particlesMeshGroup = new THREE.Group();
    this.scene.add(this.particlesMeshGroup);

    // 5. Build Environment Ground & Roads
    this.buildWorld();

    // 6. Build Player Rickshaw
    const rickshawData = createRickshawModel();
    this.rickshawGroup = rickshawData.group;
    this.leftRearWheel = rickshawData.leftRearWheel;
    this.rightRearWheel = rickshawData.rightRearWheel;
    this.frontFork = rickshawData.frontFork;
    this.pullerLegs = rickshawData.pullerLegs;

    if (!this.isSoftwareGl) {
      this.rickshawGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
    }
    this.scene.add(this.rickshawGroup);

    // Build Navigation Arrow above Rickshaw
    this.buildNavArrow();

    // 7. Setup Level Entities
    this.setupLevel(this.stats.level);

    // 8. Event Listeners
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onKeyUpBound = this.handleKeyUp.bind(this);
    this.onResizeBound = this.handleResize.bind(this);
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    window.addEventListener('resize', this.onResizeBound);

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  /**
   * Builds the 3D terrain:
   * - Highway (East side: X = 16 to 34)
   * - Main Town Road (Center: X = -8 to 4)
   * - Village Alleys & Dirt Roads (West: X = -45 to -18 and cross streets)
   * - Natural perimeter: palm tree groves, canals, green terrain
   */
  private buildWorld() {
    const worldLength = 360;
    const worldWidth = 140;

    // Green grassy terrain
    const terrainGeo = new THREE.PlaneGeometry(worldWidth, worldLength);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x166534, // lush green
      roughness: 0.9,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(-5, 0, 0);
    terrain.receiveShadow = !this.isSoftwareGl;
    this.scene.add(terrain);

    // --- 1. THE HIGHWAY (X: 16 to 34, width = 18) ---
    const highwayGeo = new THREE.PlaneGeometry(18, worldLength);
    const highwayTexture = createHighwayRoadTexture();
    highwayTexture.repeat.set(1, 30);
    const highwayMat = new THREE.MeshStandardMaterial({
      map: highwayTexture,
      roughness: 0.75,
      metalness: 0.1,
    });
    const highway = new THREE.Mesh(highwayGeo, highwayMat);
    highway.rotation.x = -Math.PI / 2;
    highway.position.set(25, 0.02, 0);
    highway.receiveShadow = !this.isSoftwareGl;
    this.scene.add(highway);

    // Highway overhead warning gantries
    [-110, 0, 110].forEach((z) => {
      const gantry = createHighwayGantryModel();
      gantry.position.set(25, 0, z);
      this.scene.add(gantry);
    });

    // Highway yellow concrete curb dividers
    const dividerGeo = new THREE.BoxGeometry(0.8, 0.35, worldLength);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
    const leftDiv = new THREE.Mesh(dividerGeo, dividerMat);
    leftDiv.position.set(15.6, 0.17, 0);
    this.scene.add(leftDiv);

    // --- 2. MAIN TOWN ROAD (X: -6 to 6, width = 12) ---
    const mainRoadGeo = new THREE.PlaneGeometry(12, worldLength);
    const mainRoadTexture = createHighwayRoadTexture();
    mainRoadTexture.repeat.set(1, 24);
    const mainRoadMat = new THREE.MeshStandardMaterial({
      map: mainRoadTexture,
      roughness: 0.8,
    });
    const mainRoad = new THREE.Mesh(mainRoadGeo, mainRoadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.02, 0);
    mainRoad.receiveShadow = !this.isSoftwareGl;
    this.scene.add(mainRoad);

    // --- 3. VILLAGE HERRINGBONE BRICK ALLEY (X: -34 to -22, width = 12) ---
    const villageRoadGeo = new THREE.PlaneGeometry(12, worldLength);
    const villageTexture = createVillageRoadTexture();
    villageTexture.repeat.set(1, 30);
    const villageMat = new THREE.MeshStandardMaterial({
      map: villageTexture,
      roughness: 0.85,
    });
    const villageRoad = new THREE.Mesh(villageRoadGeo, villageMat);
    villageRoad.rotation.x = -Math.PI / 2;
    villageRoad.position.set(-28, 0.02, 0);
    villageRoad.receiveShadow = !this.isSoftwareGl;
    this.scene.add(villageRoad);

    // Connecting Cross Streets (linking Village Alleys to Main Road and Highway)
    const crossStreetsZ = [-120, -60, 0, 60, 120];
    crossStreetsZ.forEach((z) => {
      const crossGeo = new THREE.PlaneGeometry(36, 9);
      const crossMesh = new THREE.Mesh(crossGeo, villageMat);
      crossMesh.rotation.x = -Math.PI / 2;
      crossMesh.position.set(-14, 0.025, z);
      crossMesh.receiveShadow = !this.isSoftwareGl;
      this.scene.add(crossMesh);
    });

    // --- 4. SCENERY & BANGLADESHI ROADSIDE ATMOSPHERE ---
    // Tea Stalls ("টং দোকান") along village roads and crossroads
    const teaStallCoords = [
      [-20, 0, -40, Math.PI / 2],
      [-20, 0, 40, Math.PI / 2],
      [-36, 0, 90, -Math.PI / 2],
      [-8, 0, -80, -Math.PI / 2],
      [-8, 0, 10, -Math.PI / 2],
    ];
    teaStallCoords.forEach(([x, y, z, rot]) => {
      const stall = createTeaStallModel();
      stall.position.set(x, y, z);
      stall.rotation.y = rot;
      this.scene.add(stall);
    });

    // Village houses with tin roofs
    const houseCoords = [
      [-42, 0, -100],
      [-44, 0, -50],
      [-42, 0, 20],
      [-44, 0, 70],
      [-42, 0, 130],
      [-14, 0, -140],
      [-14, 0, 140],
    ];
    houseCoords.forEach(([x, y, z]) => {
      const house = createVillageHouseModel();
      house.position.set(x, y, z);
      this.scene.add(house);
    });

    // Palm and Coconut Trees along road edges and perimeter
    for (let z = -170; z <= 170; z += 18) {
      // West perimeter
      const p1 = createPalmTreeModel();
      p1.position.set(-52 + Math.random() * 4, 0, z + Math.random() * 6);
      this.scene.add(p1);

      // East perimeter (beyond highway)
      const p2 = createPalmTreeModel();
      p2.position.set(38 + Math.random() * 4, 0, z + Math.random() * 6);
      this.scene.add(p2);

      // Island green strips between roads
      if (Math.abs(z % 60) > 15) {
        const p3 = createPalmTreeModel();
        p3.position.set(-14 + (Math.random() - 0.5) * 3, 0, z);
        this.scene.add(p3);
      }
    }
  }

  /**
   * Floating 3D Navigation Arrow above Rickshaw
   */
  private buildNavArrow() {
    this.navArrow = new THREE.Group();
    const arrowGeo = new THREE.ConeGeometry(0.35, 0.9, 8);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const cone = new THREE.Mesh(arrowGeo, arrowMat);
    cone.rotation.x = Math.PI / 2;
    this.navArrow.add(cone);

    this.navArrow.position.set(0, 2.5, 0);
    this.rickshawGroup.add(this.navArrow);
    this.navArrow.visible = false;
  }

  /**
   * Setup Entities for a specific Level
   */
  public setupLevel(levelNum: number) {
    const config = LEVEL_CONFIGS.find((l) => l.level === levelNum) || LEVEL_CONFIGS[0];
    this.stats.level = levelNum;

    // Reset player position to safe village start
    this.playerPos.set(-28, 0, -10);
    this.playerVelocity = 0;
    this.playerRotation = 0;
    this.rickshawGroup.position.copy(this.playerPos);
    this.rickshawGroup.rotation.y = 0;

    // Clear existing dynamic entities
    this.vehicles.forEach((v) => this.scene.remove(v.mesh));
    this.vehicles = [];

    this.policeUnits.forEach((p) => this.scene.remove(p.mesh));
    this.policeUnits = [];

    this.passengers.forEach((p) => {
      if (p.mesh) this.scene.remove(p.mesh);
    });
    this.passengers = [];

    if (this.activeBeacon) {
      this.scene.remove(this.activeBeacon);
      this.activeBeacon = null;
    }
    this.stats.activePassenger = null;
    if (this.navArrow) this.navArrow.visible = false;

    this.clearAngryCrowd();

    // 1. Spawn Highway Vehicles (Trucks & Buses moving fast)
    const highwayVehicleCount = Math.floor(6 * config.trafficDensity);
    for (let i = 0; i < highwayVehicleCount; i++) {
      const isBus = i % 2 === 0;
      const mesh = isBus ? createBusModel(0xef4444) : createTruckModel(0x0284c7);
      const laneX = i % 2 === 0 ? 21.5 : 28.5; // two highway lanes
      const direction = i % 2 === 0 ? 1 : -1;
      const z = -150 + i * (300 / highwayVehicleCount) + Math.random() * 10;
      mesh.position.set(laneX, 0, z);
      mesh.rotation.y = direction === 1 ? 0 : Math.PI;
      this.scene.add(mesh);

      this.vehicles.push({
        id: `h-veh-${i}`,
        type: isBus ? 'bus' : 'truck',
        x: laneX,
        z,
        speed: (12 + Math.random() * 6) * (direction === 1 ? 1 : -1),
        lane: 'highway',
        direction,
        minZ: -170,
        maxZ: 170,
        mesh,
        width: 2.2,
        length: isBus ? 6.2 : 5.8,
        color: isBus ? 0xef4444 : 0x0284c7,
      });
    }

    // 2. Spawn Main Town Road Vehicles (Cars, Buses & CNGs)
    const mainRoadVehicleCount = Math.floor(5 * config.trafficDensity);
    for (let i = 0; i < mainRoadVehicleCount; i++) {
      const typeChoice = i % 3;
      let mesh: THREE.Group;
      let type: 'car' | 'cng' | 'bus';
      let len = 3.5;

      if (typeChoice === 0) {
        mesh = createCngModel();
        type = 'cng';
        len = 2.4;
      } else if (typeChoice === 1) {
        mesh = createCarModel(0xf59e0b);
        type = 'car';
        len = 3.5;
      } else {
        mesh = createBusModel(0x10b981);
        type = 'bus';
        len = 6.0;
      }

      const laneX = i % 2 === 0 ? -2.8 : 2.8;
      const direction = i % 2 === 0 ? 1 : -1;
      const z = -140 + i * (280 / mainRoadVehicleCount) + Math.random() * 15;
      mesh.position.set(laneX, 0, z);
      mesh.rotation.y = direction === 1 ? 0 : Math.PI;
      this.scene.add(mesh);

      this.vehicles.push({
        id: `m-veh-${i}`,
        type,
        x: laneX,
        z,
        speed: (7 + Math.random() * 4) * (direction === 1 ? 1 : -1),
        lane: 'main_road',
        direction,
        minZ: -170,
        maxZ: 170,
        mesh,
        width: 1.8,
        length: len,
        color: 0xf59e0b,
      });
    }

    // 3. Spawn Highway Police Patrols
    for (let p = 0; p < config.policeCount; p++) {
      const police = createPoliceModel();
      const z = -60 + p * 120;
      police.group.position.set(25, 0, z);
      this.scene.add(police.group);

      this.policeUnits.push({
        id: `police-${p}`,
        x: 25,
        z,
        speed: 8 * (p % 2 === 0 ? 1 : -1),
        direction: p % 2 === 0 ? 1 : -1,
        minZ: -150,
        maxZ: 150,
        mesh: police.group,
        alertLevel: 0,
        sirenLightMesh: police,
      });
    }

    // 4. Spawn Passenger Candidates
    this.spawnPassengers(config.passengerCount);

    this.onNotification?.(
      `${config.nameBn} শুরু হয়েছে! টার্গেট ৳${config.targetMoney}`,
      `${config.nameEn} Started! Target: ৳${config.targetMoney}`,
      'info'
    );
  }

  /**
   * Spawns Passenger candidates along village & town road edges
   */
  private spawnPassengers(count: number) {
    const locations = [
      { nameBn: 'কাঁচা বাজার', nameEn: 'Fresh Bazaar', x: -22, z: -80 },
      { nameBn: 'প্রাথমিক বিদ্যালয়', nameEn: 'Primary School', x: -34, z: -40 },
      { nameBn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স', nameEn: 'Community Hospital', x: -6, z: 80 },
      { nameBn: 'মামার টং দোকান', nameEn: 'Mama Tea Tong', x: -22, z: 40 },
      { nameBn: 'রেলওয়ে স্টেশন', nameEn: 'Railway Station', x: 4, z: -110 },
      { nameBn: 'বায়তুল মোকাররম রোড', nameEn: 'Baitul Road', x: -34, z: 120 },
      { nameBn: 'গ্রামের মেঠোপথ বাড়ি', nameEn: 'Village Homestead', x: -35, z: 10 },
    ];

    for (let i = 0; i < count; i++) {
      const startLoc = locations[Math.floor(Math.random() * locations.length)];
      let destLoc = locations[Math.floor(Math.random() * locations.length)];
      while (destLoc === startLoc) {
        destLoc = locations[Math.floor(Math.random() * locations.length)];
      }

      const passengerColor = [0xec4899, 0x8b5cf6, 0x06b6d4, 0xf97316, 0x84cc16][i % 5];
      const pModel = createPassengerModel(passengerColor);
      pModel.group.position.set(startLoc.x + (Math.random() - 0.5) * 2, 0, startLoc.z + (Math.random() - 0.5) * 6);
      this.scene.add(pModel.group);

      const distance = Math.hypot(destLoc.x - startLoc.x, destLoc.z - startLoc.z);
      const baseFare = Math.floor(60 + distance * 0.85);

      this.passengers.push({
        id: `p-${Date.now()}-${i}`,
        nameBn: `যাত্রী ${i + 1}`,
        nameEn: `Passenger ${i + 1}`,
        x: pModel.group.position.x,
        z: pModel.group.position.z,
        destX: destLoc.x,
        destZ: destLoc.z,
        destNameBn: destLoc.nameBn,
        destNameEn: destLoc.nameEn,
        fare: baseFare,
        bonusTime: Math.floor(distance / 4 + 18),
        remainingBonusTime: Math.floor(distance / 4 + 18),
        mesh: pModel.group,
        color: passengerColor,
      });
    }
  }

  /**
   * Input Handlers
   */
  private handleKeyDown(e: KeyboardEvent) {
    if (this.isPaused || !this.isRunning) return;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.inputs.forward = true;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.inputs.backward = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.inputs.left = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.inputs.right = true;
    } else if (e.key === 'b' || e.key === 'B' || e.key === 'h' || e.key === 'H') {
      this.ringBell();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.inputs.forward = false;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.inputs.backward = false;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.inputs.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.inputs.right = false;
    }
  }

  public setInput(control: 'forward' | 'backward' | 'left' | 'right', state: boolean) {
    this.inputs[control] = state;
  }

  public ringBell() {
    soundManager.playTungBell();
    this.cameraShake = Math.max(this.cameraShake, 0.08);

    // Visual bell vibrate
    if (this.frontFork) {
      this.frontFork.rotation.z = 0.08;
      setTimeout(() => {
        if (this.frontFork) this.frontFork.rotation.z = 0;
      }, 100);
    }
  }

  public honk() {
    soundManager.playHorn();
  }

  /**
   * Start / Resume Game Loop
   */
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    this.tick();
  }

  public pause() {
    this.isPaused = true;
    soundManager.stopPoliceSiren();
  }

  public resume() {
    this.isPaused = false;
    this.clock.start();
  }

  public stop() {
    this.isRunning = false;
    soundManager.stopPoliceSiren();
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  /**
   * Main 60fps Animation Loop with Three.js Skill Pacing & Delta Clamping
   */
  private tick = () => {
    if (!this.isRunning) return;

    const rawDelta = this.clock.getDelta();
    // Clamp delta time to 0.05 to prevent spiral of death
    const dt = Math.min(rawDelta, 0.05);

    if (!this.isPaused) {
      this.updatePhysics(dt);
      this.updateVehicles(dt);
      this.updatePolice(dt);
      this.updatePassengers(dt);
      this.updateAngryCrowd(dt);
      this.updateParticles(dt);
      this.updateCamera(dt);
    }

    this.renderer.render(this.scene, this.camera);

    this.frameId = requestAnimationFrame(this.tick);
  };

  /**
   * Physics & Player Kinematics
   */
  private updatePhysics(dt: number) {
    const maxSpeed = 13.5;
    const maxReverse = -4.0;
    const acceleration = 18.0;
    const friction = 7.5;
    const brakeForce = 24.0;
    const turnSpeed = 2.6;

    // Acceleration & Braking
    if (this.inputs.forward) {
      this.playerVelocity += acceleration * dt;
      if (this.playerVelocity > maxSpeed) this.playerVelocity = maxSpeed;
      // Pedal sound occasionally
      this.pedalPhase += dt * this.playerVelocity * 3.5;
      if (Math.sin(this.pedalPhase) > 0.95 && Math.random() < 0.25) {
        soundManager.playPedalTick();
      }
    } else if (this.inputs.backward) {
      if (this.playerVelocity > 0.5) {
        // Active braking
        this.playerVelocity -= brakeForce * dt;
      } else {
        // Reverse
        this.playerVelocity -= acceleration * 0.6 * dt;
        if (this.playerVelocity < maxReverse) this.playerVelocity = maxReverse;
      }
    } else {
      // Natural rolling friction
      if (this.playerVelocity > 0) {
        this.playerVelocity -= friction * dt;
        if (this.playerVelocity < 0) this.playerVelocity = 0;
      } else if (this.playerVelocity < 0) {
        this.playerVelocity += friction * dt;
        if (this.playerVelocity > 0) this.playerVelocity = 0;
      }
    }

    // Steering
    if (Math.abs(this.playerVelocity) > 0.1) {
      const steerDirection = this.playerVelocity >= 0 ? 1 : -1;
      if (this.inputs.left) {
        this.playerRotation += turnSpeed * steerDirection * dt;
        this.steerAngle = THREE.MathUtils.damp(this.steerAngle, -0.4, 12, dt);
      } else if (this.inputs.right) {
        this.playerRotation -= turnSpeed * steerDirection * dt;
        this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0.4, 12, dt);
      } else {
        this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0, 14, dt);
      }
    } else {
      this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0, 14, dt);
    }

    // Update position
    const moveX = Math.sin(this.playerRotation) * this.playerVelocity * dt;
    const moveZ = Math.cos(this.playerRotation) * this.playerVelocity * dt;

    this.playerPos.x += moveX;
    this.playerPos.z += moveZ;

    // World boundary clamping (length -170 to 170, width -54 to 34)
    this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -170, 170);
    this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -52, 34);

    // Apply to 3D meshes
    this.rickshawGroup.position.copy(this.playerPos);
    this.rickshawGroup.rotation.y = this.playerRotation;

    // Wheel rolling rotation
    const wheelRotDelta = (this.playerVelocity * dt) / 0.46;
    this.leftRearWheel.rotation.x += wheelRotDelta;
    this.rightRearWheel.rotation.x += wheelRotDelta;
    this.frontFork.rotation.y = this.steerAngle;

    // Animated pedaling legs
    if (this.pullerLegs) {
      const legAngle = Math.sin(this.pedalPhase) * 0.35;
      this.pullerLegs.children[0].rotation.x = -0.3 + legAngle;
      this.pullerLegs.children[1].rotation.x = 0.3 - legAngle;
    }

    // Invulnerability blinking
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= dt;
      this.rickshawGroup.visible = Math.floor(this.invulnerabilityTimer * 10) % 2 === 0;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.rickshawGroup.visible = true;
      }
    }

    // Check Highway Zone (X >= 15 is the restricted Highway!)
    const isOnHighway = this.playerPos.x >= 15;
    if (isOnHighway !== this.stats.isOnHighway) {
      this.stats.isOnHighway = isOnHighway;
      if (isOnHighway) {
        soundManager.startPoliceSiren();
        this.onNotification?.('সাবধান! হাই রোডে রিকসা নিষিদ্ধ!', 'WARNING! Rickshaws banned on Highway!', 'warn');
      } else {
        soundManager.stopPoliceSiren();
      }
      this.notifyStats();
    }
  }

  /**
   * Traffic Vehicle AI and Collision Detection
   */
  private updateVehicles(dt: number) {
    this.vehicles.forEach((v) => {
      v.z += v.speed * dt;

      // Wrap around road endpoints
      if (v.speed > 0 && v.z > v.maxZ) {
        v.z = v.minZ;
      } else if (v.speed < 0 && v.z < v.minZ) {
        v.z = v.maxZ;
      }

      v.mesh.position.z = v.z;

      // Collision check with Rickshaw
      if (!this.isInvulnerable) {
        const dx = Math.abs(this.playerPos.x - v.x);
        const dz = Math.abs(this.playerPos.z - v.z);

        // Bounding collision threshold
        if (dx < 1.6 && dz < v.length * 0.5 + 0.9) {
          this.handleAccidentCollision(v);
        }
      }
    });
  }

  /**
   * Highway Police Patrol AI and Checkpoint Intercept
   */
  private updatePolice(dt: number) {
    const config = LEVEL_CONFIGS.find((l) => l.level === this.stats.level) || LEVEL_CONFIGS[0];

    this.policeUnits.forEach((p) => {
      p.z += p.speed * dt;
      if (p.z > p.maxZ) p.speed = -Math.abs(p.speed);
      if (p.z < p.minZ) p.speed = Math.abs(p.speed);

      p.mesh.position.z = p.z;
      p.mesh.rotation.y = p.speed > 0 ? 0 : Math.PI;

      // Strobe emergency lights
      if (p.sirenLightMesh) {
        const toggle = Math.sin(Date.now() * 0.015) > 0;
        p.sirenLightMesh.sirenRed.material.emissiveIntensity = toggle ? 1.5 : 0.1;
        p.sirenLightMesh.sirenBlue.material.emissiveIntensity = toggle ? 0.1 : 1.5;
      }

      // Police detection logic
      if (this.stats.isOnHighway) {
        const dist = Math.hypot(this.playerPos.x - p.x, this.playerPos.z - p.z);
        // Police spots rickshaw if within 45 units
        if (dist < 45) {
          const suspicionRate = (35 / (dist + 5)) * config.policeAlertness;
          this.stats.policeSuspicion = Math.min(100, this.stats.policeSuspicion + suspicionRate * dt * 25);
          this.notifyStats();

          // If police suspicion reaches 100%, Intercept and Fine!
          if (this.stats.policeSuspicion >= 100) {
            this.handlePoliceFine(p);
          }
        }
      }
    });

    // If player escaped into village alley, police suspicion drops quickly
    if (!this.stats.isOnHighway && this.stats.policeSuspicion > 0) {
      this.stats.policeSuspicion = Math.max(0, this.stats.policeSuspicion - 35 * dt);
      this.notifyStats();
    }
  }

  /**
   * Police Penalty & Fine Deduction
   */
  private handlePoliceFine(police: PolicePatrol) {
    const config = LEVEL_CONFIGS.find((l) => l.level === this.stats.level) || LEVEL_CONFIGS[0];
    const fineMultiplier = getDifficultyFineMultiplier(this.difficulty);
    const fineAmount = Math.round(config.highwayFine * fineMultiplier);

    this.stats.policeSuspicion = 0;
    this.stats.finesPaid += fineAmount;
    this.stats.money -= fineAmount;
    this.notifyStats();

    soundManager.playHorn();
    this.cameraShake = 0.5;

    // Check Bankruptcy
    if (this.stats.money < 0) {
      soundManager.stopPoliceSiren();
      this.isRunning = false;
      this.onGameOver?.(
        'জরিমানা দেয়ার টাকা নেই! পুলিশ রিকসা জব্দ করেছে!',
        'Bankrupt! No money to pay fine. Rickshaw impounded!'
      );
      return;
    }

    this.onNotification?.(
      `পুলিশে ধরেছে! জরিমানা কাটা হলো: ৳${fineAmount}`,
      `Caught by Police! Fined: ৳${fineAmount}`,
      'warn'
    );

    // Eject player into village entrance
    this.playerPos.set(-24, 0, police.z);
    this.playerVelocity = 0;
    this.rickshawGroup.position.copy(this.playerPos);
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 2.0;
  }

  /**
   * Accident Handling: Cartoon Crash & Angry Crowd Scene
   */
  private handleAccidentCollision(v: VehicleData) {
    this.playerVelocity = -this.playerVelocity * 0.4;
    this.cameraShake = 0.6;
    soundManager.playCrashSound();
    soundManager.playAngryMurmur();

    // Spawn dust burst particles
    this.createDustBurst(this.playerPos.x, 0.5, this.playerPos.z);

    // Deduct life
    this.stats.lives -= 1;
    this.notifyStats();

    // Spawn comical angry crowd pedestrians rushing in!
    this.spawnAngryCrowd();

    if (this.stats.lives <= 0) {
      // Game Over
      this.isRunning = false;
      soundManager.stopPoliceSiren();
      this.onGameOver?.(
        'অ্যাক্সিডেন্ট! রাগী জনতা রিকসা ঘিরে ফেলেছে!',
        'Crash! An angry crowd surrounded the rickshaw!'
      );
    } else {
      // Minor accident: invulnerability and warning
      this.isInvulnerable = true;
      this.invulnerabilityTimer = 2.5;
      this.onNotification?.(
        `ধাক্কা লেগেছে! সাবধানে চালান (জীবন বাকি: ${this.stats.lives})`,
        `Crash! Drive carefully (Lives left: ${this.stats.lives})`,
        'warn'
      );
    }
  }

  /**
   * Spawns comical cartoon angry crowd members surrounding the crash spot
   */
  private spawnAngryCrowd() {
    this.clearAngryCrowd();

    const bengaliDialogues = [
      'কি করলেন ভাই?!',
      'রাস্তা কি আপনার বাপের?!',
      'আরে থামেন থামেন!',
      'জনতা রেগে গেছে!',
    ];
    const englishDialogues = [
      'Watch where you go!',
      'Is this your personal road?!',
      'Stop right there!',
      'Angry crowd gathers!',
    ];

    const crowdCount = 4;
    for (let i = 0; i < crowdCount; i++) {
      const angle = (i * Math.PI * 2) / crowdCount;
      const startDist = 7 + Math.random() * 2;
      const x = this.playerPos.x + Math.cos(angle) * startDist;
      const z = this.playerPos.z + Math.sin(angle) * startDist;

      const pModel = createPassengerModel(0xdc2626);
      pModel.group.position.set(x, 0, z);
      this.crowdContainer.add(pModel.group);

      this.angryCrowd.push({
        x,
        z,
        targetX: this.playerPos.x + Math.cos(angle) * 2.2,
        targetZ: this.playerPos.z + Math.sin(angle) * 2.2,
        dialogueBn: bengaliDialogues[i % bengaliDialogues.length],
        dialogueEn: englishDialogues[i % englishDialogues.length],
        mesh: pModel.group,
        speed: 4.5,
        jumpPhase: Math.random() * Math.PI,
      });
    }

    // Auto-disperse crowd after 3.5 seconds
    setTimeout(() => {
      this.clearAngryCrowd();
    }, 3500);
  }

  private clearAngryCrowd() {
    this.angryCrowd.forEach((m) => {
      if (m.mesh) this.crowdContainer.remove(m.mesh);
    });
    this.angryCrowd = [];
  }

  private updateAngryCrowd(dt: number) {
    this.angryCrowd.forEach((m) => {
      // Walk towards crash point
      const dx = m.targetX - m.x;
      const dz = m.targetZ - m.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.1) {
        m.x += (dx / dist) * m.speed * dt;
        m.z += (dz / dist) * m.speed * dt;
        m.mesh.position.set(m.x, 0, m.z);
        m.mesh.lookAt(this.playerPos.x, 0, this.playerPos.z);
      }

      // Comical hopping / jumping animation
      m.jumpPhase += dt * 8;
      m.mesh.position.y = Math.abs(Math.sin(m.jumpPhase)) * 0.35;
    });
  }

  /**
   * Passenger Pickup, Dropoff & Mission Navigation
   */
  private updatePassengers(dt: number) {
    // 1. Waving animation on roadside passengers
    this.passengers.forEach((p) => {
      if (p.mesh && !this.stats.activePassenger) {
        const arm = p.mesh.children.find((c: any) => c.geometry?.type === 'CylinderGeometry' && c.position.y > 0.9);
        if (arm) {
          arm.rotation.z = -0.7 + Math.sin(Date.now() * 0.008) * 0.3;
        }

        // Check if player rickshaw is near passenger to pick up
        const dist = Math.hypot(this.playerPos.x - p.x, this.playerPos.z - p.z);
        if (dist < 3.2 && Math.abs(this.playerVelocity) < 3.5) {
          this.pickupPassenger(p);
        }
      }
    });

    // 2. Active Passenger destination check
    if (this.stats.activePassenger) {
      const p = this.stats.activePassenger;
      p.remainingBonusTime = Math.max(0, p.remainingBonusTime - dt);

      // Rotate destination gem
      if (this.activeBeacon) {
        const gem = this.activeBeacon.getObjectByName('beacon_gem');
        if (gem) {
          gem.rotation.y += dt * 2.5;
        }
      }

      // Update Navigation Arrow orientation pointing towards destination
      if (this.navArrow) {
        const dx = p.destX - this.playerPos.x;
        const dz = p.destZ - this.playerPos.z;
        const targetAngle = Math.atan2(dx, dz);
        // Relative to rickshaw rotation
        this.navArrow.rotation.y = targetAngle - this.playerRotation;
      }

      // Check arrival at destination
      const destDist = Math.hypot(this.playerPos.x - p.destX, this.playerPos.z - p.destZ);
      if (destDist < 3.5 && Math.abs(this.playerVelocity) < 3.5) {
        this.dropoffPassenger(p);
      }
    }
  }

  /**
   * Pick up passenger into Rickshaw
   */
  private pickupPassenger(p: PassengerData) {
    this.stats.activePassenger = p;
    soundManager.playTungBell();

    // Hide passenger from roadside
    if (p.mesh) {
      this.scene.remove(p.mesh);
    }

    // Spawn destination beacon
    if (this.activeBeacon) this.scene.remove(this.activeBeacon);
    this.activeBeacon = createDestinationBeacon();
    this.activeBeacon.position.set(p.destX, 0, p.destZ);
    this.scene.add(this.activeBeacon);

    // Show nav arrow
    if (this.navArrow) this.navArrow.visible = true;

    this.onNotification?.(
      `যাত্রী উঠেছেন! গন্তব্য: ${p.destNameBn}`,
      `Passenger aboard! Heading to: ${p.destNameEn}`,
      'info'
    );
    this.notifyStats();
  }

  /**
   * Drop off passenger and award fare + speed tip
   */
  private dropoffPassenger(p: PassengerData) {
    const tipBonus = p.remainingBonusTime > 0 ? Math.floor(p.remainingBonusTime * 4.5) : 0;
    const totalEarned = p.fare + tipBonus;

    this.stats.money += totalEarned;
    this.stats.passengersServed += 1;
    this.stats.activePassenger = null;

    soundManager.playCoinSound();
    this.createCoinParticles(p.destX, 1.5, p.destZ);

    if (this.activeBeacon) {
      this.scene.remove(this.activeBeacon);
      this.activeBeacon = null;
    }
    if (this.navArrow) this.navArrow.visible = false;

    // Check High Score
    if (this.stats.money > this.stats.highScore) {
      this.stats.highScore = this.stats.money;
      try {
        localStorage.setItem('rickshaw_high_score', String(this.stats.highScore));
      } catch {}
    }

    this.onNotification?.(
      `গন্তব্যে পৌঁছেছেন! ভাড়া: ৳${p.fare} + টিপস: ৳${tipBonus}`,
      `Arrived! Fare: ৳${p.fare} + Tip: ৳${tipBonus}`,
      'success'
    );

    // Remove finished passenger from list & spawn a new passenger
    this.passengers = this.passengers.filter((item) => item.id !== p.id);
    this.spawnPassengers(1);

    this.notifyStats();

    // Check Level Complete Target
    const config = LEVEL_CONFIGS.find((l) => l.level === this.stats.level) || LEVEL_CONFIGS[0];
    if (this.stats.money >= config.targetMoney) {
      this.handleLevelVictory();
    }
  }

  /**
   * Level Victory
   */
  private handleLevelVictory() {
    soundManager.playVictoryFanfare();
    soundManager.stopPoliceSiren();

    const currentLevel = this.stats.level;
    const nextUnlocked = Math.max(this.stats.unlockedLevels, currentLevel + 1);
    this.stats.unlockedLevels = Math.min(10, nextUnlocked);

    try {
      localStorage.setItem('rickshaw_unlocked_level', String(this.stats.unlockedLevels));
    } catch {}

    this.onLevelCleared?.(currentLevel, this.stats.money);
  }

  /**
   * Camera Chase & Shake
   */
  private updateCamera(dt: number) {
    // Camera follows behind and above rickshaw with smooth damping
    const camDistance = 15;
    const camHeight = 15.5;

    _vec3Target.set(
      this.playerPos.x - Math.sin(this.playerRotation) * camDistance * 0.45,
      camHeight,
      this.playerPos.z - camDistance
    );

    // Smooth exponential damping
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _vec3Target.x, 8, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _vec3Target.y, 8, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _vec3Target.z, 8, dt);

    // Apply camera shake if any
    if (this.cameraShake > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.cameraShake = THREE.MathUtils.damp(this.cameraShake, 0, 9, dt);
    }

    _vec3.set(this.playerPos.x, 1.2, this.playerPos.z + 5);
    this.camera.lookAt(_vec3);
  }

  /**
   * Particle Systems: Dust & Gold Coins
   */
  private createDustBurst(x: number, y: number, z: number) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.18, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.8 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.particlesMeshGroup.add(mesh);

      this.particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        vz: (Math.random() - 0.5) * 6,
        life: 0.6,
        maxLife: 0.6,
        size: 0.18,
        color: 0xd97706,
        mesh,
      });
    }
  }

  private createCoinParticles(x: number, y: number, z: number) {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xfde047,
        emissiveIntensity: 0.5,
        metalness: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.particlesMeshGroup.add(mesh);

      this.particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 5,
        vy: 3 + Math.random() * 5,
        vz: (Math.random() - 0.5) * 5,
        life: 0.9,
        maxLife: 0.9,
        size: 0.16,
        color: 0xfacc15,
        mesh,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        if (p.mesh) this.particlesMeshGroup.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 9.8 * dt; // gravity

      if (p.mesh) {
        p.mesh.position.set(p.x, p.y, p.z);
        const scale = p.life / p.maxLife;
        p.mesh.scale.set(scale, scale, scale);
      }
    }
  }

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private notifyStats() {
    this.onStatsUpdate?.({ ...this.stats });
  }

  public dispose() {
    this.stop();
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    window.removeEventListener('resize', this.onResizeBound);

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
