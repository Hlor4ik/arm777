import courtyardBg from './courtyard-bg.webp';
import starIcon from './star-icon.png';
import houseShed from './house-shed.png';
import houseRoom from './house-room.png';
import houseCottage from './house-cottage.png';
import houseTownhouse from './house-townhouse.png';
import houseVilla from './house-villa.png';
import petLamb from './pet-lamb.png';
import petKitten from './pet-kitten.png';
import petPuppy from './pet-puppy.png';
import petEagle from './pet-eagle.png';
import petLion from './pet-lion.png';
import vehicleBike from './vehicle-bike.png';
import vehicleScooter from './vehicle-scooter.png';
import vehicleSedan from './vehicle-sedan.png';
import vehicleSuv from './vehicle-suv.png';
import vehicleSport from './vehicle-sport.png';

export const WORLD_ASSETS = {
  courtyardBg,
  starIcon,
  home: [houseShed, houseRoom, houseCottage, houseTownhouse, houseVilla],
  pet: [petLamb, petKitten, petPuppy, petEagle, petLion],
  vehicle: [vehicleBike, vehicleScooter, vehicleSedan, vehicleSuv, vehicleSport],
} as const;

export function getTrackAsset(track: 'home' | 'pet' | 'car', level: number): string | null {
  if (level <= 0) return null;
  const list = track === 'home' ? WORLD_ASSETS.home : track === 'pet' ? WORLD_ASSETS.pet : WORLD_ASSETS.vehicle;
  return list[Math.min(level, list.length) - 1] ?? null;
}

export function getNextTrackAsset(track: 'home' | 'pet' | 'car', level: number): string | null {
  return getTrackAsset(track, level + 1);
}
