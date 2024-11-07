const LoadingIndicator = ({ className }: { className?: string }) => {
  return (
    <div
      className={`w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export default LoadingIndicator
