// components/ScratchCard.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";

interface ScratchCardProps {
  width?: number;
  height?: number;
  onComplete?: (discount: number) => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  width = 320,
  height = 160,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Generate random discount between 5% and 75%
  const generateDiscount = () => Math.floor(Math.random() * (75 - 5 + 1)) + 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw red overlay
    ctx.fillStyle = "#B91C1C";
    ctx.fillRect(0, 0, width, height);

    // Erase overlay on scratch
    ctx.globalCompositeOperation = "destination-out";

    let scratched = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      return { x: 0, y: 0 };
    };

    const scratch = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const { x, y } = getPos(e);
      scratch(x, y);
    };

    const startScratch = () => {
      setIsScratching(true);
      if (discount === 0) setDiscount(generateDiscount()); // generate discount on first scratch
    };

    const endScratch = () => {
      setIsScratching(false);

      // Check how much scratched
      const imageData = ctx.getImageData(0, 0, width, height);
      const total = imageData.data.length / 4;
      let transparent = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 128) transparent++;
      }

      if (transparent / total > 0.5 && !scratched) {
        scratched = true;
        setRevealed(true);
        onComplete && onComplete(discount);
      }
    };

    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mouseup", endScratch);
    canvas.addEventListener("mousemove", (e) => isScratching && handleMove(e));
    canvas.addEventListener("touchstart", startScratch);
    canvas.addEventListener("touchend", endScratch);
    canvas.addEventListener("touchmove", (e) => isScratching && handleMove(e));

    return () => {
      canvas.removeEventListener("mousedown", startScratch);
      canvas.removeEventListener("mouseup", endScratch);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchstart", startScratch);
      canvas.removeEventListener("touchend", endScratch);
      canvas.removeEventListener("touchmove", handleMove);
    };
  }, [isScratching, discount, width, height, onComplete]);

  return (
    <div className="relative inline-block">
      {/* Coupon content */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-white text-black rounded-lg shadow-lg font-bold text-2xl transition-opacity duration-500 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
        style={{ width, height }}
      >
        🎉 {discount}% OFF 🎉
      </div>

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg cursor-pointer shadow-lg"
      />
    </div>
  );
};

export default ScratchCard;
