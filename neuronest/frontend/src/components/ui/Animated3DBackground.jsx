import React, { useEffect, useRef } from 'react';

export default function Animated3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Create floating particles
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 4 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.speedZ = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() * 70 + 90; // Greener range
        this.opacity = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.z -= this.speedZ;

        // Parallax effect based on Z
        const scale = 1000 / (1000 + this.z);
        this.displayX = (this.x - canvas.width / 2) * scale + canvas.width / 2;
        this.displayY = (this.y - canvas.height / 2) * scale + canvas.height / 2;
        this.displaySize = this.size * scale;

        // Reset if out of bounds or too close
        if (this.z < 1 || this.displayX < 0 || this.displayX > canvas.width || 
            this.displayY < 0 || this.displayY > canvas.height) {
          this.reset();
          this.z = 1000;
        }
      }

      draw() {
        const scale = 1000 / (1000 + this.z);
        const opacity = this.opacity * scale;
        
        ctx.fillStyle = `hsla(${this.hue}, 60%, 70%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.displayX, this.displayY, this.displaySize, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.displayX, this.displayY, 0,
          this.displayX, this.displayY, this.displaySize * 3
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 60%, 70%, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.displayX, this.displayY, this.displaySize * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    const particleCount = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Floating geometric shapes
    const shapes = [];
    class Shape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 60 + 40;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.08 + 0.03;
        this.type = Math.floor(Math.random() * 3); // 0: circle, 1: triangle, 2: square
      }

      update() {
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = `rgba(122, 154, 122, ${this.opacity})`;
        ctx.lineWidth = 2;

        if (this.type === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.stroke();
        } else if (this.type === 1) {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size * 0.866, this.size * 0.5);
          ctx.lineTo(-this.size * 0.866, this.size * 0.5);
          ctx.closePath();
          ctx.stroke();
        } else {
          // Square
          ctx.strokeRect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
        }

        ctx.restore();
      }
    }

    // Create shapes
    for (let i = 0; i < 5; i++) {
      shapes.push(new Shape());
    }

    // Wave effect
    function drawWaves() {
      ctx.strokeStyle = 'rgba(212, 231, 212, 0.05)';
      ctx.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const offset = i * 100;
        const waveHeight = 30;
        const waveLength = 200;

        for (let x = 0; x < canvas.width + waveLength; x += 10) {
          const y = canvas.height * 0.3 + offset + 
                    Math.sin((x + time * 0.5) / waveLength * Math.PI * 2) * waveHeight;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }

    // Animation loop
    function animate() {
      time++;

      // Create subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8f9fa');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#f0f9f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      drawWaves();

      // Draw shapes
      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      // Draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].displayX - particles[j].displayX;
          const dy = particles[i].displayY - particles[j].displayY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            const opacity = (1 - distance / 180) * 0.15;
            ctx.strokeStyle = `rgba(122, 154, 122, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].displayX, particles[i].displayY);
            ctx.lineTo(particles[j].displayX, particles[j].displayY);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}


