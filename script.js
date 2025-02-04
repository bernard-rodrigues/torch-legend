import {animateTorch} from './vfx/vfx.js'

// Constants defining various game element sizes
const CHARACTERSIZE = 0.025; // Relative size of the main character

// DOM elements
const container = document.getElementById("container");
const mainCharacter = document.getElementById("main-character");

// Limits for character movement within the game world
const HERO_POS_X_LIMIT = 130.5;
const HERO_POS_Y_LIMIT = 97.1;
const STEP = 0.1; // Movement step size

// Initial character position
let heroPosition = {
    x: 0,
    y: 0
};

// Object storing key states (pressed or not)
let keys = {
    keyW: false,
    keyS: false,
    keyA: false,
    keyD: false,

    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,

    space: false
};

// Function to move the character based on pressed keys
const moveCharacter = (keys) => {
    let dx = 0, dy = 0;

    // Determine movement direction
    if (keys.keyW || keys.arrowUp) dy -= STEP;
    if (keys.keyS || keys.arrowDown) dy += STEP;
    if (keys.keyA || keys.arrowLeft) dx -= STEP;
    if (keys.keyD || keys.arrowRight) dx += STEP;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx /= Math.sqrt(2);
        dy /= Math.sqrt(2);
    }

    // Ensure movement stays within game boundaries
    heroPosition.x = Math.max(0, Math.min(HERO_POS_X_LIMIT, heroPosition.x + dx));
    heroPosition.y = Math.max(0, Math.min(HERO_POS_Y_LIMIT, heroPosition.y + dy));
};

// Function to update container and character sizes based on screen size
const updateContainer = (screenHeight, screenWidth) => {
    const isWider = screenWidth >= (4 / 3) * screenHeight;
    const height = isWider ? 100 : 100 * (3 / 4);
    const unit = isWider ? "vh" : "vw";
    const scale = isWider ? 1 : 3 / 4;

    // Update container size
    container.style.height = `${height}${unit}`;
    container.style.width = isWider ? `${height * (4 / 3)}vh` : "100vw";

    // Update character position and size
    mainCharacter.style.height = `${height * CHARACTERSIZE}${unit}`;
    mainCharacter.style.top = `${heroPosition.y * scale}${unit}`;
    mainCharacter.style.left = `${heroPosition.x * scale}${unit}`;
};

// Main game loop function
const gameLoop = () => {
    moveCharacter(keys); // Update character position
    updateContainer(window.innerHeight, window.innerWidth); // Adjust screen elements
    requestAnimationFrame(gameLoop); // Continue the loop
};

// Event listener for when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Start the main game loop
    requestAnimationFrame(gameLoop);

    // Animate the torch at a fixed interval of 100ms
    setInterval(() => animateTorch(window.innerHeight, window.innerWidth), 100);

    // Listen for key press events
    addEventListener("keydown", (event) => {
        switch(event.code) {
            case 'KeyA': keys.keyA = true; break;
            case 'KeyW': keys.keyW = true; break;
            case 'KeyS': keys.keyS = true; break;
            case 'KeyD': keys.keyD = true; break;
            case 'ArrowUp': keys.arrowUp = true; break;
            case 'ArrowDown': keys.arrowDown = true; break;
            case 'ArrowLeft': keys.arrowLeft = true; break;
            case 'ArrowRight': keys.arrowRight = true; break;
            case 'Space': keys.space = true; break;
        }
    });

    // Listen for key release events
    addEventListener("keyup", (event) => {
        switch(event.code) {
            case 'KeyA': keys.keyA = false; break;
            case 'KeyW': keys.keyW = false; break;
            case 'KeyS': keys.keyS = false; break;
            case 'KeyD': keys.keyD = false; break;
            case 'ArrowUp': keys.arrowUp = false; break;
            case 'ArrowDown': keys.arrowDown = false; break;
            case 'ArrowLeft': keys.arrowLeft = false; break;
            case 'ArrowRight': keys.arrowRight = false; break;
            case 'Space': keys.space = false; break;
        }
    });
});