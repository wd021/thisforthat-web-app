'use client'

import { useEffect, useState } from 'react'

const PWA = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasSeenPrompt = localStorage.getItem('pwa-prompt-seen')

    if (hasSeenPrompt) {
      return
    }

    // Only show on mobile devices that aren't installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile && !isStandalone) {
      // Detect platform
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setPlatform('ios')
      } else if (/Android/i.test(navigator.userAgent)) {
        setPlatform('android')
      }
      setShowPrompt(true)
    }
  }, [])

  const handleDismiss = () => {
    // Store in localStorage that user has seen the prompt
    localStorage.setItem('pwa-prompt-seen', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  const instructions = {
    ios: [
      'Tap the share button',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" to confirm',
    ],
    android: ['Tap the menu button (⋮)', 'Tap "Add to Home screen"', 'Tap "Add" to confirm'],
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-[1000]'>
      <div className='relative max-w-lg mx-auto'>
        <button
          onClick={handleDismiss}
          className='absolute right-0 top-0 p-1 hover:bg-gray-100 rounded-full'
          aria-label='Close'
        >
          <span className='text-gray-500 flex items-center justify-center w-5 h-5'>
            <span className='relative block w-4 h-4'>
              <span className='absolute w-4 h-0.5 bg-current transform rotate-45 top-1/2 left-0' />
              <span className='absolute w-4 h-0.5 bg-current transform -rotate-45 top-1/2 left-0' />
            </span>
          </span>
        </button>

        <div className='pr-8'>
          <h3 className='font-semibold text-lg mb-2'>Get the This For That App</h3>

          <p className='text-gray-600 text-sm mb-3'>
            While we&apos;re developing a mobile app, you can add TFT to your home screen by
            following the steps below.
          </p>

          {platform !== 'other' && (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>How to install:</p>
              <ol className='text-sm text-gray-600 space-y-1 ml-5 list-decimal'>
                {instructions[platform].map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PWA
