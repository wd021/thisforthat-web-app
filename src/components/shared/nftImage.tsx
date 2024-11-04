import { FC, useState } from 'react'

const NFTImage: FC<{
  src: string
  alt: string
  fallback: string
  rounded?: 'top' | 'all'
}> = ({ src, alt, fallback, rounded = 'top' }) => {
  const [error, setError] = useState<boolean>(false)

  const imageContent = error ? (
    <div
      className={`w-full aspect-square flex items-center justify-center text-center p-4 bg-gray-200 ${rounded === 'top' ? 'rounded-t-lg' : 'rounded-lg'}`}
    >
      <span className='text-gray-600 font-semibold break-words truncate'>{fallback}</span>
    </div>
  ) : (
    <div
      className={`w-full aspect-square ${rounded === 'top' ? 'rounded-t-lg' : 'rounded-lg'} overflow-hidden shadow-sm relative`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200`}
        onError={() => setError(true)}
      />
    </div>
  )

  return imageContent
}

export default NFTImage
