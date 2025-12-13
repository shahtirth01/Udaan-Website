/* 
 * Liquid Interactive Logic
 * ------------------------
 * Handles mouse-driven SVG distortion, background parallax, and 3D tilt.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiquidDistortion();
    initParallaxBackground();
    initTiltEffect();
});

/* 1. Mouse-Driven SVG Distortion 
   Updates the feTurbulence baseFrequency based on mouse speed/position.
*/
function initLiquidDistortion() {
    const turbulence = document.querySelector('#glass-distortion feTurbulence');
    const displacement = document.querySelector('#glass-distortion feDisplacementMap');

    if (!turbulence || !displacement) return;

    let targetFreq = 0.01; // Low base frequency = ripples
    let currentFreq = 0.01;
    let targetScale = 5;
    let currentScale = 5;

    document.addEventListener('mousemove', (e) => {
        // Calculate speed or position influence
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        // Distortion increases near edges or with movement
        // Let's make it "boil" slightly on movement
        targetFreq = 0.02 + (Math.abs(0.5 - x) * 0.05);
        targetScale = 10 + (y * 20); // More distortion at bottom
    });

    // Smooth animation loop - Slower, "heavier" liquid
    function animate() {
        // Decrease lerp factor from 0.1 to 0.02 for much smoother/slower reaction
        currentFreq += (targetFreq - currentFreq) * 0.02;
        currentScale += (targetScale - currentScale) * 0.02;

        turbulence.setAttribute('baseFrequency', currentFreq);
        displacement.setAttribute('scale', currentScale);

        requestAnimationFrame(animate);
    }
    animate();
}

/* 2. Parallax Background 
   Moves the background position slightly opposite to mouse movement.
*/
function initParallaxBackground() {
    const bg = document.querySelector('.glass-background');
    if (!bg) return;

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        // Update CSS variables or style directly
        bg.style.backgroundPosition = `${x}px ${y}px`;
    });
}

/* 3. 3D Tilt Effect for Glass Cards 
   Simple vanilla implementation of tilt.
*/
function initTiltEffect() {
    const cards = document.querySelectorAll('.glass-element, .event-card, .sponsor-card, .team-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (max 10deg)
            const xPct = x / rect.width;
            const yPct = y / rect.height;

            const xRot = (0.5 - yPct) * 10; // Rotate X based on Y pos
            const yRot = (xPct - 0.5) * 10; // Rotate Y based on X pos

            card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;

            // Interactive Glare
            card.style.background = `
                radial-gradient(
                    circle at ${x}px ${y}px, 
                    rgba(255,255,255,0.2) 0%, 
                    rgba(255,255,255,0.05) 40%, 
                    transparent 80%
                ),
                rgba(255, 255, 255, 0.05)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.background = 'rgba(255, 255, 255, 0.05)'; // Reset to default
        });
    });
}
