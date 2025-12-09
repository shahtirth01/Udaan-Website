document.addEventListener('DOMContentLoaded', () => {

    // --- 1. FILTER LOGIC & TABS (Preserved) --- //
    if (document.getElementById('events-grid')) initFilters();
    initAboutTabs();

    // --- 3. TEAM TABS (Nested) --- //
    initTeamTabs();

    // --- 4. FIREWORKS ANIMATION --- //
    initFireworks();

});

function initTeamTabs() {
    const teamBtns = document.querySelectorAll('.team-tab-btn');
    const teamContents = document.querySelectorAll('.team-tab-content');

    if (teamBtns.length === 0) return;

    teamBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            teamBtns.forEach(b => b.classList.remove('active'));
            teamContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabName = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabName}-tab`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

/* =========================================================================
   UI LOGIC (Filters & Tabs)
   ========================================================================= */
function initFilters() {
    const catBtns = document.querySelectorAll('.cat-btn');
    const dayRadios = document.querySelectorAll('input[name="day"]');
    const eventCards = document.querySelectorAll('.event-card');
    let currentCategory = 'all';
    let currentDay = 'all';

    function filterEvents() {
        const hasGsap = typeof gsap !== 'undefined';

        // Animate Out
        if (hasGsap) {
            gsap.to(eventCards, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: doFilter });
        } else {
            doFilter();
        }

        function doFilter() {
            let visibleCount = 0;
            eventCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                const cardDay = card.getAttribute('data-day');
                const catMatch = (currentCategory === 'all') || (cardCat === currentCategory);
                const dayMatch = (currentDay === 'all') || (cardDay === currentDay);

                if (catMatch && dayMatch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Animate In
            if (visibleCount > 0 && hasGsap) {
                const visibleCards = Array.from(eventCards).filter(c => c.style.display !== 'none');
                gsap.fromTo(visibleCards,
                    { opacity: 0, scale: 0.95 },
                    { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05 }
                );
            }
        }
    }

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            filterEvents();
        });
    });

    dayRadios.forEach(radio => {
        radio.parentElement.addEventListener('click', () => {
            document.querySelectorAll('.day-radio').forEach(l => l.classList.remove('active'));
            radio.parentElement.classList.add('active');
            radio.checked = true;
            currentDay = radio.value;
            filterEvents();
        });
    });
}

function initAboutTabs() {
    const tabBtns = document.querySelectorAll('.about-tab-btn');
    const tabContents = document.querySelectorAll('.about-tab-content');

    if (tabBtns.length === 0) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabName = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabName}-tab`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

/* =========================================================================
   PHYSICS FIREWORKS ENGINE
   Features: Gravity, Air Resistance, Neon Glow, Multiple Shell Types
   ========================================================================= */
function initFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cw = window.innerWidth;
    let ch = window.innerHeight;

    // Resize Handler
    const resizeCanvas = () => {
        cw = canvas.width = window.innerWidth;
        ch = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Configuration
    const CONFIG = {
        gravity: 0.08,             // Pulls particles down
        friction: 0.96,            // Air resistance
        wind: 0,                   // Slight breeze (can randomize)
        particlesPerExplosion: 60,
        rocketSpawnRate: 0.02,     // Chance per frame 
        baseHue: 10                // Cycling hue
    };

    let fireworks = [];
    let particles = [];
    let hue = 120;

    // --- UTILS ---
    const random = (min, max) => Math.random() * (max - min) + min;
    const calculateDistance = (p1x, p1y, p2x, p2y) => {
        const xDistance = p1x - p2x;
        const yDistance = p1y - p2y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    };

    // --- FIREWORK (Rocket) ---
    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.sx = sx;
            this.sy = sy;
            this.tx = tx;
            this.ty = ty;
            this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
            this.distanceTraveled = 0;

            // Track past coordinates for trail effect
            this.coordinates = [];
            this.coordinateCount = 3;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }

            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 2;
            this.acceleration = 1.05;
            this.brightness = random(50, 70);

            // Random target radius circle
            this.targetRadius = 1;
        }

        update(index) {
            // Remove last item in coordinates array
            this.coordinates.pop();
            // Add current coordinates to the start of the array
            this.coordinates.unshift([this.x, this.y]);

            // Cycle target radius
            if (this.targetRadius < 8) this.targetRadius += 0.3;
            else this.targetRadius = 1;

            // Speed up
            this.speed *= this.acceleration;

            // Get current velocities based on angle and speed
            const vx = Math.cos(this.angle) * this.speed;
            const vy = Math.sin(this.angle) * this.speed;

            this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

            // Reached target?
            if (this.distanceTraveled >= this.distanceToTarget) {
                createParticles(this.tx, this.ty); // Explode
                fireworks.splice(index, 1);
            } else {
                this.x += vx;
                this.y += vy;
            }
        }

        draw() {
            ctx.beginPath();
            // Move to the last tracked coordinate in the set, then draw a line to the current x and y
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
            ctx.lineWidth = 2; // Thicker trail
            ctx.shadowBlur = 10; // Neon Glow
            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            ctx.stroke();

            // Reset shadows for performance? No, keep them for the nice look
        }
    }

    // --- PARTICLE (Explosion) ---
    class Particle {
        constructor(x, y, colorHue) {
            this.x = x;
            this.y = y;
            this.coordinates = [];
            this.coordinateCount = 5; // Long trails
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }

            // Explosion Physics
            this.angle = random(0, Math.PI * 2);
            this.speed = random(1, 10);
            this.friction = CONFIG.friction;
            this.gravity = CONFIG.gravity;

            this.hue = random(colorHue - 20, colorHue + 20);
            this.brightness = random(50, 80);
            this.alpha = 1;
            this.decay = random(0.015, 0.03); // Variance in fade
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed + CONFIG.wind;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;

            this.alpha -= this.decay;

            if (this.alpha <= this.decay) {
                particles.splice(index, 1);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
            ctx.stroke();
        }
    }

    function createParticles(x, y) {
        let particleCount = CONFIG.particlesPerExplosion;
        // Occasional Massive Explosion
        if (Math.random() < 0.2) particleCount *= 2;

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(x, y, hue));
        }
    }

    // --- MAIN LOOP ---
    function loop() {
        requestAnimationFrame(loop);

        hue += 0.5; // Slowly cycle base hue

        // Trail effect (destination-out)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 0.2 means longer trails than 0.5
        ctx.fillRect(0, 0, cw, ch);

        // Additive blending for explosions
        ctx.globalCompositeOperation = 'lighter';

        // Draw Fireworks
        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        // Draw Particles
        let k = particles.length;
        while (k--) {
            particles[k].draw();
            particles[k].update(k);
        }

        // Launch logic
        if (Math.random() < CONFIG.rocketSpawnRate) {
            // Launch from bottom to random height top half
            // x: random, y: ch
            // target: random x, random y top 50%
            fireworks.push(new Firework(
                cw / 2, // Start middle bottom? No, simpler
                ch,
                random(0, cw),
                random(0, ch / 2)
            ));

            // Multiple launch
            if (Math.random() < 0.1) {
                fireworks.push(new Firework(cw / 4, ch, random(0, cw / 2), random(0, ch / 2)));
                fireworks.push(new Firework(3 * cw / 4, ch, random(cw / 2, cw), random(0, ch / 2)));
            }
        }
    }

    // Start
    loop();
}
