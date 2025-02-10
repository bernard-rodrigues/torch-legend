// Limits for character movement within the game world
export const HERO_POS_X_MAX_LIMIT = 130.5;
export const HERO_POS_Y_MAX_LIMIT = 97.1;
export const STEP = 0.25; // Movement step size

// Prevent monsters from spawn next to hero
export const SAFE_START_DISTANCE = HERO_POS_X_MAX_LIMIT * 0.25;

// Number of new monsters by level
export const NEW_MONSTER_SPAWNING = 5;

export const RELATIVE_CHARACTER_SIZE = 0.025; // Relative size of the main character

export const TOUCH_DEAD_ZONE = 10; // Minimum distance before registering a direction