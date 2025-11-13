import React, { useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const getTailwindColor = (className) => {
  const el = document.createElement('div');
  el.className = className;
  el.style.display = 'none';
  document.body.appendChild(el);
  const color = getComputedStyle(el).backgroundColor;
  document.body.removeChild(el);
  return color;
};

// Helper to detect dark mode
const isDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const SquaresAnim = (props) => {
  const { isDarkMode: themeIsDarkMode } = useTheme();
  const isDarkMode = props.isDarkMode !== undefined ? props.isDarkMode : themeIsDarkMode;
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const numSquaresX = useRef(0);
  const numSquaresY = useRef(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set border color based on theme
    const twGrayLight = getTailwindColor('bg-gray-200'); // light mode
    const twGrayDark = getTailwindColor('bg-gray-800'); // dark mode
    const twWhite = getTailwindColor('bg-white');

    let gridBorderColor = isDarkMode ? twGrayDark : twGrayLight;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / props.squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / props.squareSize) + 1;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / props.squareSize) * props.squareSize;
      const startY = Math.floor(gridOffset.current.y / props.squareSize) * props.squareSize;

      for (let x = startX; x < canvas.width + props.squareSize; x += props.squareSize) {
        for (let y = startY; y < canvas.height + props.squareSize; y += props.squareSize) {
          const squareX = x - (gridOffset.current.x % props.squareSize);
          const squareY = y - (gridOffset.current.y % props.squareSize);

          if (
            hoveredSquareRef.current &&
            Math.floor((x - startX) / props.squareSize) ===
            hoveredSquareRef.current.x &&
            Math.floor((y - startY) / props.squareSize) === hoveredSquareRef.current.y
          ) {
            ctx.fillStyle = twWhite;
            ctx.fillRect(squareX, squareY, props.squareSize, props.squareSize);
          }

          ctx.strokeStyle = gridBorderColor;
          ctx.strokeRect(squareX, squareY, props.squareSize, props.squareSize);
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(props.speed, 0.1);
      switch (props.direction) {
        case "right":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + props.squareSize) % props.squareSize;
          break;
        case "left":
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + props.squareSize) % props.squareSize;
          break;
        case "up":
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + props.squareSize) % props.squareSize;
          break;
        case "down":
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + props.squareSize) % props.squareSize;
          break;
        case "diagonal":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + props.squareSize) % props.squareSize;
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + props.squareSize) % props.squareSize;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / props.squareSize) * props.squareSize;
      const startY = Math.floor(gridOffset.current.y / props.squareSize) * props.squareSize;

      const hoveredSquareX = Math.floor(
        (mouseX + gridOffset.current.x - startX) / props.squareSize
      );
      const hoveredSquareY = Math.floor(
        (mouseY + gridOffset.current.y - startY) / props.squareSize
      );

      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== hoveredSquareX ||
        hoveredSquareRef.current.y !== hoveredSquareY
      ) {
        hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [props.direction, props.speed, props.squareSize, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border-none block pointer-events-none"
    ></canvas>
  );
};

export default SquaresAnim;
