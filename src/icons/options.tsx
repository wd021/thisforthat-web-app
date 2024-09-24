import React, { type SVGProps } from "react";

export default function Options(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      enableBackground="new 0 0 16 16"
      viewBox="0 0 16 16"
      width="26"
      height="26"
      {...props}
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
          <feOffset dx="0.5" dy="0.5" result="offsetblur" />
          <feFlood floodColor="rgba(0,0,0,0.5)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <circle cx="2" cy="8" r="2" fill="currentColor" />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <circle cx="14" cy="8" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}
