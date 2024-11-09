const ErrorBubble: React.FC<{
  errorMsg: string
}> = ({ errorMsg }) => {
  let message

  if (errorMsg.includes('User rejected the request')) {
    message = 'Transaction cancelled.'
  } else {
    message = errorMsg
  }

  return (
    <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm overflow-hidden'>
      <svg
        className='w-4 h-4 flex-shrink-0'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <span>{message}</span>
    </div>
  )
}

export default ErrorBubble
