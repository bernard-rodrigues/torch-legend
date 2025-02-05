import {animateTorch, RELATIVE_TORCH_SIZE} from './vfx/vfx.js'

// Constants defining various game element sizes
const NUM_MONSTERS = 50;
const RELATIVE_CHARACTER_SIZE = 0.025; // Relative size of the main character

// DOM elements
const container = document.getElementById("container");
const mainCharacter = document.getElementById("main-character");
const gameover = document.getElementById("game-over");

// Limits for character movement within the game world
const HERO_POS_X_MAX_LIMIT = 130.5;
const HERO_POS_Y_MAX_LIMIT = 97.1;
const STEP = 0.1; // Movement step size
const SAFE_START_DISTANCE = HERO_POS_X_MAX_LIMIT * 0.25;

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

let monsters = [];
let monsterDivs = []

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
    heroPosition.x = Math.max(0, Math.min(HERO_POS_X_MAX_LIMIT, heroPosition.x + dx));
    heroPosition.y = Math.max(0, Math.min(HERO_POS_Y_MAX_LIMIT, heroPosition.y + dy));
};

const moveMonster = (monster, containerHeight) => {
    const angle = Math.atan2(heroPosition.y - monster.y, heroPosition.x - monster.x);

    const vect = monster.key ? -1 : 1;
    const speedFactor = monster.key ? 0.75 : 0.5;

    const dx = Math.cos(angle) * STEP * speedFactor;
    const dy = Math.sin(angle) * STEP * speedFactor;

    // Calculate new positions
    const newX = monster.x + dx * vect;
    const newY = monster.y + dy * vect;

    // Clamp the new positions within game limits
    monster.x = Math.max(0, Math.min(HERO_POS_X_MAX_LIMIT + (containerHeight*RELATIVE_CHARACTER_SIZE)/2, newX));
    monster.y = Math.max(0, Math.min(HERO_POS_Y_MAX_LIMIT + (containerHeight*RELATIVE_CHARACTER_SIZE)/2, newY));
}

const idleMonsterMovement = (monster) => {
    if (Math.random() < 0.98) return; // Only move occasionally (2% chance per frame)

    const idleStep = 0.2; // Small movement range
    const angle = Math.random() * Math.PI * 2; // Random direction

    const dx = Math.cos(angle) * idleStep;
    const dy = Math.sin(angle) * idleStep;

    monster.x = Math.max(0, Math.min(HERO_POS_X_MAX_LIMIT, monster.x + dx));
    monster.y = Math.max(0, Math.min(HERO_POS_Y_MAX_LIMIT, monster.y + dy));
};

const isCloseToHero = (monster) => {
    const height = window.innerWidth >= (4/3)*window.innerHeight ? 100 : 100*(3/4);
    const distance = Math.sqrt((monster.x - heroPosition.x)**2 + (monster.y - heroPosition.y)**2);
    
    return distance < RELATIVE_TORCH_SIZE*height*0.60;
}

// Function to update container and character sizes based on screen size
const updateContainer = () => {
    const isWider = window.innerWidth >= (4 / 3) * window.innerHeight;
    const containerHeight = isWider ? 100 : 100 * (3 / 4);
    const unit = isWider ? "vh" : "vw";
    const scale = isWider ? 1 : 3 / 4;

    // Update container size
    container.style.height = `${containerHeight}${unit}`;
    container.style.width = isWider ? `${containerHeight * (4 / 3)}vh` : "100vw";

    // Update character position and size
    mainCharacter.style.height = `${containerHeight * RELATIVE_CHARACTER_SIZE}${unit}`;
    mainCharacter.style.top = `${heroPosition.y * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/2}${unit}`;
    mainCharacter.style.left = `${heroPosition.x * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/2}${unit}`;

    // Update monsters positions
    monsters.forEach((monster, index) => {
        if(isCloseToHero(monster)){
            moveMonster(monster, containerHeight);
        }else {
            idleMonsterMovement(monster);
        }
        const monsterDiv = monsterDivs[index];
        monsterDiv.style.height = `${containerHeight * RELATIVE_CHARACTER_SIZE * 2}${unit}`;
        monsterDiv.style.left = `${monster.x * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/4}${unit}`;
        monsterDiv.style.top = `${monster.y * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/4}${unit}`;
        monsterDiv.style.backgroundImage = monster.key ? "url('./assets/key.png')" : "url('./assets/monster.png')";
        // Smooth animation using CSS transition
        // monsterDiv.style.transition = "top 0.3s ease-in-out, left 0.3s ease-in-out";
    });
};

const createMonsters = () => {
    monsters = Array.from({length: NUM_MONSTERS}, () => {
        let x, y;

        do {
            x = Math.random() * HERO_POS_X_MAX_LIMIT;
            y = Math.random() * HERO_POS_Y_MAX_LIMIT;
        } while (Math.sqrt(x ** 2 + y ** 2) < SAFE_START_DISTANCE); // Ensure it's not too close
    
        return { x, y, key: false };
    });

    // Select one random monster index before generating the array
    const keyMonsterIndex = Math.floor(Math.random() * NUM_MONSTERS);

    monsters[keyMonsterIndex].key = true;

    monsterDivs = monsters.map(() => {
        // Create a new div element for each monster
        const div = document.createElement('div');
        
        // Add a class to the monster div
        div.classList.add('monster');

        // Append the monster div to the container
        container.appendChild(div);
        return div;
    });
}

const checkCollision = () => {
    const height = window.innerWidth >= (4/3)*window.innerHeight ? 100 : 100*(3/4);
    const heroSize = RELATIVE_CHARACTER_SIZE * height;
    const monsterSize = (RELATIVE_CHARACTER_SIZE / 2) * height;
    
    for (const monster of monsters) {
        const distance = Math.sqrt((monster.x - heroPosition.x) ** 2 + (monster.y - heroPosition.y) ** 2);
        if (distance < (heroSize + monsterSize) / 2) {
            return monster; // Retorna o monstro com o qual houve colisão
        }
    }
    return null; // Nenhuma colisão
};

// Main game loop function
const gameLoop = () => {
    moveCharacter(keys); // Update character position
    updateContainer(); // Adjust screen elements
    
    const collidedMonster = checkCollision();
    if(!collidedMonster){
        requestAnimationFrame(gameLoop); // Continue the loop
    }else{
        gameover.style.display = "block";
        gameover.innerText = collidedMonster.key ? "You won!" : "You lose...";
    }
};

// Event listener for when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Create monsters in the map
    createMonsters();
    
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