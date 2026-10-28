import { LevelConfig, Difficulty } from '../types/game';

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    targetMoney: 400,
    trafficDensity: 0.8,
    policeAlertness: 0.8,
    policeCount: 1,
    highwayFine: 100,
    passengerCount: 3,
    nameBn: 'লেভেল ১: শান্ত মেঠোপথ',
    nameEn: 'Level 1: Quiet Village Roads',
  },
  {
    level: 2,
    targetMoney: 800,
    trafficDensity: 1.0,
    policeAlertness: 1.0,
    policeCount: 1,
    highwayFine: 150,
    passengerCount: 3,
    nameBn: 'লেভেল ২: কাঁচা বাজার মোড়',
    nameEn: 'Level 2: Bazaar Junction',
  },
  {
    level: 3,
    targetMoney: 1300,
    trafficDensity: 1.2,
    policeAlertness: 1.2,
    policeCount: 2,
    highwayFine: 200,
    passengerCount: 4,
    nameBn: 'লেভেল ৩: স্কুল ও হাসপাতালের ভিড়',
    nameEn: 'Level 3: School & Clinic Rush',
  },
  {
    level: 4,
    targetMoney: 1800,
    trafficDensity: 1.4,
    policeAlertness: 1.4,
    policeCount: 2,
    highwayFine: 250,
    passengerCount: 4,
    nameBn: 'লেভেল ৪: হাই রোড চেকপোস্ট',
    nameEn: 'Level 4: Highway Checkpoint',
  },
  {
    level: 5,
    targetMoney: 2400,
    trafficDensity: 1.6,
    policeAlertness: 1.6,
    policeCount: 2,
    highwayFine: 300,
    passengerCount: 4,
    nameBn: 'লেভেল ৫: দুপুরের তীব্র যানজট',
    nameEn: 'Level 5: Midday Jam',
  },
  {
    level: 6,
    targetMoney: 3000,
    trafficDensity: 1.8,
    policeAlertness: 1.8,
    policeCount: 3,
    highwayFine: 350,
    passengerCount: 5,
    nameBn: 'লেভেল ৬: দূরপাল্লার বাস ও ট্রাক',
    nameEn: 'Level 6: Intercity Bus Alley',
  },
  {
    level: 7,
    targetMoney: 3700,
    trafficDensity: 2.0,
    policeAlertness: 2.0,
    policeCount: 3,
    highwayFine: 400,
    passengerCount: 5,
    nameBn: 'লেভেল ৭: সজাগ ট্রাফিক পুলিশ',
    nameEn: 'Level 7: Vigilant Patrols',
  },
  {
    level: 8,
    targetMoney: 4400,
    trafficDensity: 2.2,
    policeAlertness: 2.2,
    policeCount: 3,
    highwayFine: 450,
    passengerCount: 5,
    nameBn: 'লেভেল ৮: গলি ও হাইওয়ের দৌড়াদৌড়ি',
    nameEn: 'Level 8: Alley Escape Rush',
  },
  {
    level: 9,
    targetMoney: 5200,
    trafficDensity: 2.5,
    policeAlertness: 2.5,
    policeCount: 4,
    highwayFine: 500,
    passengerCount: 6,
    nameBn: 'লেভেল ৯: মহা ব্যাস্ত ঢাকা মেট্রো',
    nameEn: 'Level 9: Mega Metro Frenzy',
  },
  {
    level: 10,
    targetMoney: 6000,
    trafficDensity: 2.8,
    policeAlertness: 2.8,
    policeCount: 4,
    highwayFine: 600,
    passengerCount: 6,
    nameBn: 'লেভেল ১০: কিংবদন্তি রিকসাওয়ালা',
    nameEn: 'Level 10: Legendary Rickshawala',
  },
];

export function getMaxLivesForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 3;
    case 'medium':
      return 2;
    case 'hard':
      return 1;
    default:
      return 3;
  }
}

export function getDifficultyFineMultiplier(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 0.7;
    case 'medium':
      return 1.0;
    case 'hard':
      return 1.5;
    default:
      return 1.0;
  }
}
