/* 
 * Innovative Liquid Canvas Background
 * -----------------------------------
 * Renders smooth, glowing, organic "liquid orbs" on a background canvas.
 * Colors: Deep Blue, Cyan, Purple to match "Retina Deep Blue" theme.
 */

const canvas = document.createElement('canvas');
canvas.id = 'liquid-canvas';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];

// Configuration
const ORB_COUNT = 6;
const COLORS = [
    'rgba(0, 212, 255, 0.4)',  // Cyan
    'rgba(9, 9, 121, 0.4)',    // Deep Blue
    'rgba(144, 19, 254, 0.4)', // Purple
    'rgba(0, 31, 63, 0.6)'     // Midnight
];

/* Orb Class */
class Orb {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 300 + 200; // Large, soft orbs
        this.dx = (Math.random() - 0.5) * 1.5; // Slow movement
        this.dy = (Math.random() - 0.5) * 1.5;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.growth = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off edges gently
        if (this.x < -200 || this.x > width + 200) this.dx *= -1;
        if (this.y < -200 || this.y > height + 200) this.dy *= -1;

        // Pulse radius
        this.radius += Math.sin(Date.now() * 0.001) * 0.5;
    }

    draw() {
        ctx.beginPath();
        // Create radial gradient for soft, glowing look
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Fade to transparent

        ctx.fillStyle = gradient;
        // Composite operation "screen" or "lighter" allows blending
        ctx.globalCompositeOperation = 'screen';
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; // Reset
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function init() {
    resize();
    for (let i = 0; i < ORB_COUNT; i++) {
        orbs.push(new Orb());
    }
    loop();
}

function loop() {
    // Clear with a very dark blue to maintain deep background
    ctx.fillStyle = '#020024'; // Very Dark Deep Blue Base
    ctx.fillRect(0, 0, width, height);

    orbs.forEach(orb => {
        orb.update();
        orb.draw();
    });

    requestAnimationFrame(loop);
}

window.addEventListener('resize', resize);
// Start the animation
init();
