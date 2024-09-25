import { type SVGProps } from "react";

export default function Activity(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" {...props}>
      <rect fill="none" height="256" width="256" />
      <polyline
        fill="none"
        points="24 128 56 128 96 40 160 208 200 128 232 128"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}
