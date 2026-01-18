export enum OwlAction {
  IDLE = 'IDLE',
  WALKING = 'WALKING',
  HUNTING = 'HUNTING', // Spotted a bug
  ATTACKING = 'ATTACKING', // Smashing the bug
  CELEBRATING = 'CELEBRATING', // Rolling eyes / proud
  SLEEPING = 'SLEEPING',
  TELLING_JOKE = 'TELLING_JOKE' // Cute squint + joke
}

export interface Position {
  x: number;
  y: number;
}

export interface BugEntity {
  id: string;
  x: number;
  y: number;
  isSquashed: boolean;
}

export interface OwlProps {
  action: OwlAction;
  targetPosition?: Position | null; // Where the owl is looking/walking towards
  lookAt?: Position | null; // Specific focus point for eyes
}