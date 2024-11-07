const LoadMore = ({
  className,
  onClick,
  isLoading,
}: {
  className?: string
  onClick: () => void
  isLoading: boolean
}) => {
  return (
    <div className='flex justify-center my-4'>
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-6 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <div className='animate-spin rounded-full border-t-transparent border-[2px] h-5 w-5 border-gray-900' />
        ) : (
          'Load More'
        )}
      </button>
    </div>
  )
}

export default LoadMore
