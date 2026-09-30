// Filename: client/src/components/ui/Squares.jsx (CORRECTED PREMIUM VERSION)

import { useRef, useEffect } from 'react';

const Squares = ({
  direction = 'diagonal',
  speed = 0.2,
  squareSize = 60,
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (event) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.current.x = event.clientX - rect.left;
        mousePos.current.y = event.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
        mousePos.current.x = -1000; // Move mouse position far away on leave
        mousePos.current.y = -1000;
    });

    const drawGrid = () => {
      if (!ctx) return;
      
      // --- FIX 1: Set the canvas background color here, instead of CSS ---
      ctx.fillStyle = '#F8FAFC'; // This is Tailwind's bg-slate-50 color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let x = -squareSize; x < canvas.width + squareSize; x += squareSize) {
        for (let y = -squareSize; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          // Create a subtle gradient for the lines
          const gradient = ctx.createLinearGradient(squareX, squareY, squareX + squareSize, squareY + squareSize);
          gradient.addColorStop(0, 'rgba(224, 231, 255, 0.5)'); // Light Indigo (indigo-100)
          gradient.addColorStop(1, 'rgba(199, 210, 254, 0.5)'); // A bit darker Indigo (indigo-200)
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);

            // Hover Effect
            const dist = Math.sqrt(
                Math.pow(mousePos.current.x - (squareX + squareSize / 2), 2) +
                Math.pow(mousePos.current.y - (squareY + squareSize / 2), 2)
            );

            if (dist < 120) { // Radius of hover effect
                const alpha = Math.max(0, 0.2 - dist / 120 / 2); // Fades out
                ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`; // Indigo-500
                ctx.fillRect(squareX, squareY, squareSize, squareSize);
            }
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.05);
      switch (direction) {
        case 'diagonal':
        default:
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed);
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed * 0.5);
          break;
      }
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, speed, squareSize]);

  return (
    // --- FIX 2: Removed the CSS background from here ---
    <canvas 
        ref={canvasRef} 
        className="w-full h-full border-none block"
    ></canvas>
  );
};

export default Squares;