const HEIGHTNOISE = 1.5; // Noise variation for the torch animation
const TORCHSIZE = 0.15; // Relative size of the torch

const torch = document.getElementById("torch");

// Function to animate the torch with random flickering effects
export const animateTorch = (screenHeight, screenWidth) => {
    const heightNoise = (Math.random() * HEIGHTNOISE) - HEIGHTNOISE / 2;
    const lightNoise = (Math.random() / 5) + 0.4;
    
    // Adjust torch size based on screen dimensions
    if (screenWidth >= (4 / 3) * screenHeight) {
        const height = 100;
        torch.style.height = `${height * TORCHSIZE + heightNoise}vh`;
    } else {
        const height = 100 * (3 / 4);
        torch.style.height = `${height * TORCHSIZE + heightNoise}vw`;
    }
    
    // Apply random flickering effect
    torch.style.backgroundImage = `radial-gradient(rgba(255,255,255,${lightNoise}), 20%, rgba(255,255,255,0))`;
};