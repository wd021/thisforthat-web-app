import { type SVGProps } from 'react'

interface HeartProps extends SVGProps<SVGSVGElement> {
  filled?: boolean
}

const Heart: React.FC<HeartProps> = ({ filled, ...props }) => {
  return (
    <svg
      className='w-4 h-4'
      fill={filled ? 'currentColor' : 'none'}
      viewBox='0 0 24 24'
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      />
    </svg>
  )
}

export default Heart
