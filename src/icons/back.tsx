import { type SVGProps } from "react";

export default function Back(props: SVGProps<SVGSVGElement>) {
  return (
    <svg height="24" viewBox="0 0 24 24" width="24" {...props}>
      <path d="M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z" />
    </svg>
  );
}
