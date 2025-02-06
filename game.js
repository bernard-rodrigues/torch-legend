import { HERO_POS_X_MAX_LIMIT, HERO_POS_Y_MAX_LIMIT, STEP, SAFE_START_DISTANCE, NEW_MONSTER_SPAWNING, RELATIVE_CHARACTER_SIZE } from './modules/constants.js';
import { MESSAGES } from './modules/messages.js';
import {animateTorch, RELATIVE_TORCH_SIZE} from './vfx/vfx.js';

// DOM elements
const menu = document.getElementById("menu");
const container = document.getElementById("container");
const mainCharacter = document.getElementById("main-character");
const messages = document.getElementById("messages");
const message = document.getElementById("message");
const button = document.getElementById("button");
const start = document.getElementById("start");

// Initial character position
let heroPosition = {
    x: Math.random() * HERO_POS_X_MAX_LIMIT,
    y: Math.random() * HERO_POS_Y_MAX_LIMIT
};

let num_monsters = 1;
let zoom = 2;
let zoomSpeed = 0.001;

/* 
0: in game; 
1: tutorial message 1;
2: tutorial message 2; 
3: tutorial message 3;
4: win;
5: lose;
*/
let gameState = 0;

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
    if (keys.keyA || keys.arrowLeft){
        dx -= STEP;
        mainCharacter.style.transform = "translate(-50%, -50%) scaleX(-1)"
    }
    if (keys.keyD || keys.arrowRight){
        dx += STEP;
        mainCharacter.style.transform = "translate(-50%, -50%) scaleX(1)"
    }

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
    container.style.transformOrigin = `${(heroPosition.x/HERO_POS_X_MAX_LIMIT)*100}% ${(heroPosition.y/HERO_POS_Y_MAX_LIMIT)*100}%`;
    container.style.transform = `scale(${zoom})`;

    // Update character position and size
    mainCharacter.style.height = `${containerHeight * RELATIVE_CHARACTER_SIZE}${unit}`;
    mainCharacter.style.top = `${heroPosition.y * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/2}${unit}`;
    mainCharacter.style.left = `${heroPosition.x * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/2}${unit}`;

    let shouldZoomIn = monsters.some(isCloseToHero);
    if (shouldZoomIn) {
        zoom += zoomSpeed;
    } else {
        zoom = zoom > 1 ? zoom - zoomSpeed * 5 : 1;
    }

    // Update monsters positions
    monsters.forEach((monster, index) => {
        const monsterDiv = monsterDivs[index];

        if(isCloseToHero(monster)){
            moveMonster(monster, containerHeight);
        }else {
            idleMonsterMovement(monster);
        }
        monsterDiv.style.height = `${containerHeight * RELATIVE_CHARACTER_SIZE * 1.5}${unit}`;
        monsterDiv.style.left = `${monster.x * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/4}${unit}`;
        monsterDiv.style.top = `${monster.y * scale + (containerHeight * RELATIVE_CHARACTER_SIZE)/4}${unit}`;
        monsterDiv.style.backgroundImage = monster.key ? "url('./assets/key.png')" : "url('./assets/monster.png')";
    });
};

const createMonsters = () => {
    monsterDivs.forEach(monsterDiv => {
        monsterDiv.remove(); // Remove each element
    });
    
    monsters = Array.from({length: num_monsters}, () => {
        let x, y;

        do {
            x = Math.random() * HERO_POS_X_MAX_LIMIT;
            y = Math.random() * HERO_POS_Y_MAX_LIMIT;
        } while (Math.sqrt((heroPosition.x - x) ** 2 + (heroPosition.y - y) ** 2) < SAFE_START_DISTANCE); // Ensure it's not too close to hero
    
        return { x, y, key: false };
    });

    // Select one random monster index before generating the array
    const keyMonsterIndex = Math.floor(Math.random() * num_monsters);

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
    if(gameState === 0){
        container.style.display = "none";
        messages.style.display = "none";
        menu.style.display = "block";
    } else if (gameState >= 1 && gameState <= 5) {
        container.style.display = "none";
        messages.style.display = "flex";
        menu.style.display = "none";
        message.innerText = MESSAGES[`tutorial${gameState}`] || MESSAGES[gameState === 4 ? 'win' : 'lose'];
    } else {
        container.style.display = "block";
        messages.style.display = "none";
        menu.style.display = "none";
        moveCharacter(keys);
        updateContainer();
        const collidedMonster = checkCollision();
        if (collidedMonster) {
            gameState = collidedMonster.key ? 4 : 5;
        }
    }
    requestAnimationFrame(gameLoop);
};

const reset_game = (new_num_monsters) => {
    num_monsters = new_num_monsters;
    zoom = 2;
    heroPosition.x = Math.random() * HERO_POS_X_MAX_LIMIT;
    heroPosition.y = Math.random() * HERO_POS_Y_MAX_LIMIT;
    createMonsters()
    gameState = 6;
}

const handleButtonClick = () => {
    if(gameState === 0){
        gameState = 1;
    }else if(gameState === 1){
        gameState = 2;
    }else if(gameState === 2){
        reset_game(1);
    }else if(gameState === 3){
        reset_game(num_monsters*NEW_MONSTER_SPAWNING);
    }else if(gameState === 4){
        if(num_monsters === 1){
            gameState = 3;
        }else{
            reset_game(num_monsters+NEW_MONSTER_SPAWNING);
        }
    }else if(gameState === 5){
        gameState = 0;
    }
}

const setupEventListeners = () => {
    button.addEventListener("click", handleButtonClick);
    start.addEventListener("click", handleButtonClick);
    
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
}

// Event listener for when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Create monsters in the map
    createMonsters();
    
    requestAnimationFrame(gameLoop);

    // Animate the torch at a fixed interval of 100ms
    setInterval(() => animateTorch(window.innerHeight, window.innerWidth), 100);

    setupEventListeners();
});