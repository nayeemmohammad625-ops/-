export type Language = 'bn' | 'en';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'level_cleared' | 'game_over' | 'level_select';

export interface LevelConfig {
  level: number;
  targetMoney: number;
  trafficDensity: number; // multiplier
  policeAlertness: number; // rate of police suspicion
  policeCount: number;
  highwayFine: number; // fine amount
  passengerCount: number;
  nameBn: string;
  nameEn: string;
}

export interface PassengerData {
  id: string;
  nameBn: string;
  nameEn: string;
  x: number;
  z: number;
  destX: number;
  destZ: number;
  destNameBn: string;
  destNameEn: string;
  fare: number;
  bonusTime: number; // seconds
  remainingBonusTime: number;
  mesh?: any;
  destMesh?: any;
  color: number;
}

export interface VehicleData {
  id: string;
  type: 'bus' | 'truck' | 'car' | 'cng';
  x: number;
  z: number;
  speed: number;
  lane: 'highway' | 'main_road' | 'alley';
  direction: number; // 1 or -1
  minZ: number;
  maxZ: number;
  mesh?: any;
  width: number;
  length: number;
  color: number;
}

export interface PolicePatrol {
  id: string;
  x: number;
  z: number;
  speed: number;
  direction: number;
  minZ: number;
  maxZ: number;
  mesh?: any;
  alertLevel: number; // 0 to 1
  sirenLightMesh?: any;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  mesh?: any;
}

export interface AngryCrowdMember {
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  dialogueBn: string;
  dialogueEn: string;
  mesh?: any;
  speed: number;
  jumpPhase: number;
}

export interface GameStats {
  money: number;
  level: number;
  lives: number;
  maxLives: number;
  passengersServed: number;
  finesPaid: number;
  policeSuspicion: number; // 0 to 100
  isOnHighway: boolean;
  activePassenger: PassengerData | null;
  highScore: number;
  unlockedLevels: number;
}
