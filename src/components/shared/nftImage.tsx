import { FC, useState } from 'react'

interface NFTImageProps {
  src: string
  alt: string
  fallback: string
  rounded?: 'top' | 'all'
  rings?: boolean
}

const NFTImage: FC<NFTImageProps> = ({
  src,
  alt,
  fallback,
  rounded = 'top',
  rings = false,
}) => {
  const [error, setError] = useState<boolean>(false)

  const baseClasses = `w-full aspect-square ${
    rounded === 'top' ? 'rounded-t-lg' : 'rounded-lg'
  } overflow-hidden`

  const containerClasses = `${baseClasses} ${
    rings ? 'ring-2 ring-white' : 'shadow-sm relative'
  }`

  if (error) {
    return (
      <div
        className={`${containerClasses} flex items-center justify-center text-center p-4 bg-gray-200`}
      >
        <span className='text-gray-600 font-semibold break-words truncate'>{fallback}</span>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <img
        src={src}
        alt={alt}
        className='w-full h-full object-cover transition-transform duration-200'
        onError={() => setError(true)}
      />
    </div>
  )
}

export default NFTImage
