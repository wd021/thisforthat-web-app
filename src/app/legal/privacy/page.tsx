'use client'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'

const PrivacyPage: React.FC = () => {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'} items-center justify-center`}
      >
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. It is [Your Company]&apos;s policy to respect your
          privacy regarding any information we may collect from you across our website,
          [Website], and other sites we own and operate.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We only ask for personal information when we truly need it to provide a service to
          you. We collect it by fair and lawful means, with your knowledge and consent. We also
          let you know why we&apos;re collecting it and how it will be used.
        </p>
        <h2>How We Use Information</h2>
        <p>
          We only retain collected information for as long as necessary to provide you with your
          requested service. What data we store, we&apos;ll protect within commercially
          acceptable means to prevent loss and theft, as well as unauthorized access,
          disclosure, copying, use or modification.
        </p>
        <h2>Your Rights</h2>
        <p>
          You are free to refuse our request for your personal information, with the
          understanding that we may be unable to provide you with some of your desired services.
        </p>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about how we handle user data and personal information, feel
          free to contact us.
        </p>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default PrivacyPage
