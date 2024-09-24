import { type SVGProps } from "react";

export default function Checkmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg enableBackground="new 0 0 24 24;" viewBox="0 0 24 24" {...props}>
      <path d="M10,18c-0.5,0-1-0.2-1.4-0.6l-4-4c-0.8-0.8-0.8-2,0-2.8c0.8-0.8,2.1-0.8,2.8,0l2.6,2.6l6.6-6.6   c0.8-0.8,2-0.8,2.8,0c0.8,0.8,0.8,2,0,2.8l-8,8C11,17.8,10.5,18,10,18z" />
    </svg>
  );
}
