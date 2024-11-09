import Link from 'next/link'
import { User } from '@supabase/supabase-js'

import { useCommentSection } from '@/hooks'
import { OfferMessage, Profile } from '@/types/supabase'
import { timeAgoShort } from '@/utils/helpers'

import { LoadMore } from '../shared/buttons'

const MessageItem: React.FC<{ message: OfferMessage }> = ({ message }) => (
  <div className='group flex items-start space-x-2.5 rounded-md p-1.5 pr-4'>
    <Link
      href={`/${message.username ? message.username : '/about'}`}
      target='_blank'
      className='relative h-10 w-10 flex-shrink-0'
    >
      <img
        src={
          message.type === 'user'
            ? process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + message.profile_pic_url
            : '/logo_min.png'
        }
        alt={message.type === 'user' ? message.username : 'TFT'}
        className='rounded-full object-cover w-full h-full'
      />
    </Link>
    <div className='flex-1 min-w-0'>
      <div className='flex items-center gap-x-1'>
        <span className='text-xs text-gray-900 font-semibold cursor-pointer'>
          {message.type === 'user' ? message.username : 'This For That'}
        </span>
        <span className='text-gray-400'>·</span>
        <time className='text-xs text-gray-500'>
          {timeAgoShort(new Date(message.created_at))}
        </time>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: message.message }}
        className='offer-message text-sm text-gray-700 whitespace-pre-wrap break-words leading-snug mt-0.5'
      />
    </div>
  </div>
)

const CommentSection: React.FC<{
  offerId: string
  count: number
  user: User | null
  profile: Profile | null
}> = ({ offerId, count, user, profile }) => {
  const {
    messages,
    newMessage,
    loading,
    hasMore,
    page,
    commentCount,
    commentsContainerRef,
    setNewMessage,
    setPage,
    fetchMessages,
    submitMessage,
    checkIfNearBottom,
  } = useCommentSection({ offerId, user, profile, initialCommentCount: count })

  return (
    <div
      className='rounded-lg border border-gray-200 bg-white shadow-sm'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='border-b border-gray-100 py-2 px-3 flex items-center gap-x-1.5'>
        <h3 className='text-sm font-medium text-gray-900'>Comments</h3>
        <span className='text-gray-400'>·</span>
        <time className='text-sm text-gray-500'>{commentCount}</time>
      </div>

      <div
        ref={commentsContainerRef}
        className='min-h-[50px] max-h-[350px] overflow-y-auto custom-scrollbar p-3 space-y-3 bg-gray-50'
        onScroll={checkIfNearBottom}
      >
        {messages.length > 0 && hasMore && (
          <LoadMore
            isLoading={loading}
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              fetchMessages(nextPage)
            }}
          />
        )}
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>

      <div className='border-t border-gray-100 p-3 bg-white rounded-b-lg'>
        <form onSubmit={submitMessage} className='flex items-center gap-x-2'>
          <div className='relative flex-1'>
            <svg
              className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
            </svg>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Write a comment...'
              className='w-full pl-8 pr-2 py-1 text-sm focus:outline-none placeholder:text-gray-400'
            />
            {loading && (
              <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                <div className='animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-300 border-t-blue-600' />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommentSection
