"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

// ScratchCard Component
const ScratchCard: React.FC<{ discount: number }> = ({ discount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = 320;
    canvas.height = 192;

    // Fill overlay
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiled watermark
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.font = "20px Arial";
    const patternText = "ZORODOOR ";
    const textWidth = ctx.measureText(patternText).width;

    for (let y = 20; y < canvas.height; y += 40) {
      for (let x = 0; x < canvas.width; x += textWidth) {
        ctx.fillText(patternText, x, y);
      }
    }

    let isDrawing = false;

    const scratch = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      let x: number, y: number;

      if ("touches" in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = (e as MouseEvent).clientX - rect.left;
        y = (e as MouseEvent).clientY - rect.top;
      }

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkScratched = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 128) transparentPixels++;
      }
      const scratchedPercent =
        (transparentPixels / (canvas.width * canvas.height)) * 100;
      if (scratchedPercent > 40) setScratched(true);
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      scratch(e);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      scratch(e);
    };

    const handleEnd = () => {
      isDrawing = false;
      checkScratched();
    };

    // Event Listeners
    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("mouseleave", handleEnd);
    canvas.addEventListener("touchstart", handleStart);
    canvas.addEventListener("touchmove", handleMove);
    canvas.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("mouseleave", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleEnd);
    };
  }, []);

  return (
    <div className="w-80 h-48 relative rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
      {/* Hidden Discount */}
      {scratched && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-2xl font-bold text-black bg-gradient-to-br from-yellow-300 to-orange-500">
          <span>🎉 You won! 🎉</span>
          <span>{discount}% OFF</span>
        </div>
      )}
      {/* Canvas Overlay */}
      {!scratched && <canvas ref={canvasRef} className="absolute inset-0" />}
    </div>
  );
};

// Landing Page
export default function LandingPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [formData, setFormData] = useState({ name: "", number: "", email: "" });
  const [discount, setDiscount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ Added loader state

  // Animate title & button
  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power3.out",
      });
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save user data");

      const randomDiscount = Math.floor(Math.random() * (75 - 5 + 1)) + 5;
      setDiscount(randomDiscount);
      setShowForm(false);
      setShowScratchCard(true);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-black text-white">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] 
                      bg-[size:40px_40px] opacity-10 pointer-events-none"></div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="relative z-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-wide mb-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
      >
        ZORODOOR
      </h1>

      <div className="relative z-10">
        {/* Get Discount Button */}
        {!showForm && !showScratchCard && (
          <button
            ref={buttonRef}
            className="px-10 py-4 text-xl font-bold bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            Get Discount
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-4 bg-white text-black p-6 rounded-lg shadow-lg w-80"
          >
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="p-2 border rounded focus:ring-2 focus:ring-red-400 outline-none"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.number}
              required
              pattern="[0-9]{10}"
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              className="p-2 border rounded focus:ring-2 focus:ring-red-400 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="p-2 border rounded focus:ring-2 focus:ring-red-400 outline-none"
            />

            {/* Submit Button with Loader */}
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-red-600 text-white font-bold rounded transition-all ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-red-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        )}

        {/* Scratch Card */}
        {showScratchCard && discount !== null && (
          <ScratchCard discount={discount} />
        )}
      </div>
    </div>
  );
}
