import { type SVGProps } from 'react'

export default function Expand(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill='none'
      height='14'
      width='14'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
      {...props}
    >
      <line x1='7' x2='17' y1='17' y2='7' />
      <polyline points='7 7 17 7 17 17' />
    </svg>
  )
}
