import { FC, useState } from 'react'

const NFTImage: FC<{
  src: string
  alt: string
  fallback: string
  rounded?: 'top' | 'all'
  hoverOn?: boolean
}> = ({ src, alt, fallback, rounded = 'top', hoverOn = false }) => {
  const [error, setError] = useState<boolean>(false)

  const imageContent = error ? (
    <div
      className={`aspect-square flex items-center justify-center text-center p-4 bg-gray-200 ${rounded === 'top' ? 'rounded-t-lg' : 'rounded-lg'}`}
    >
      <span className='text-gray-600 font-semibold break-words'>{fallback}</span>
    </div>
  ) : (
    <div
      className={`w-full aspect-square ${rounded === 'top' ? 'rounded-t-lg' : 'rounded-lg'} overflow-hidden shadow-sm relative ${hoverOn ? 'group' : ''}`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200 ${hoverOn ? 'group-hover:scale-110' : ''}`}
        onError={() => setError(true)}
      />
      {hoverOn && (
        <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2'>
          <span className='text-white text-sm font-semibold break-words text-center'>
            {fallback}
          </span>
        </div>
      )}
    </div>
  )

  return imageContent
}

export default NFTImage
