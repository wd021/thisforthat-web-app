import { FC } from 'react'
import Link from 'next/link'

const Footer: FC = () => {
  return (
    <footer className='fixed bottom-0 flex h-[50px] w-full items-center i justify-between bg-gray-100 border-t border-gray-200 px-6'>
      <div>© TFT Labs</div>
      <nav className='text-sm sm:text-base'>
        <Link href='/about'>About</Link>
        <span className='mx-2 text-gray-400'>·</span>
        <Link href='/legal/terms'>Terms</Link>
        <span className='mx-2 text-gray-400'>·</span>
        <Link href='/legal/privacy'>Privacy</Link>
        <span className='mx-2 text-gray-400'>·</span>
        <Link href='https://discord.gg/qg6TeBuHeT' target='_blank'>
          Discord
        </Link>
      </nav>
    </footer>
  )
}

export default Footer
