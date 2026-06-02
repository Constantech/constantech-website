import React from "react";

interface ConstantechLogoProps {
  className?: string;
}

export const ConstantechLogo: React.FC<ConstantechLogoProps> = ({ className = "h-8 w-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Navy Blue Inner Arc (starts with a filled circle, then curves around) */}
      <circle cx="50" cy="24" r="5" fill="#3b82f6" />
      <path
        d="M 50 24 A 26 26 0 1 0 70 70"
        stroke="#3b82f6"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Center Green Capsule Outline */}
      <rect
        x="42"
        y="41"
        width="46"
        height="18"
        rx="9"
        stroke="#10b981"
        strokeWidth="5"
        fill="none"
      />

      {/* Outer Green C Arc */}
      <path
        d="M 66 10 A 40 40 0 1 0 66 90"
        stroke="#10b981"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Bottom Right Connected Circle Outline */}
      {/* Thin line connecting the outer path to the circle */}
      <path
        d="M 66 90 Q 74 90 74 84"
        stroke="#10b981"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="74"
        cy="84"
        r="6"
        stroke="#10b981"
        strokeWidth="5"
        fill="none"
      />
    </svg>
  );
};
