import courtyardBg from './courtyard-bg.webp';
import starIcon from './star-icon.webp';
import houseShed from './house-shed.webp';
import houseRoom from './house-room.webp';
import houseCottage from './house-cottage.webp';
import houseTownhouse from './house-townhouse.webp';
import houseVilla from './house-villa.webp';
import petLamb from './pet-lamb.webp';
import petKitten from './pet-kitten.webp';
import petPuppy from './pet-puppy.webp';
import petEagle from './pet-eagle.webp';
import petLion from './pet-lion.webp';
import vehicleBike from './vehicle-bike.webp';
import vehicleScooter from './vehicle-scooter.webp';
import vehicleSedan from './vehicle-sedan.webp';
import vehicleSuv from './vehicle-suv.webp';
import vehicleSport from './vehicle-sport.webp';

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
