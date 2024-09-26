import { type SVGProps } from "react";

export default function Filter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="40"
      viewBox="0 0 16 16"
      width="40"
      {...props}
    >
      <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}
