'use client'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'

const PrivacyPage = () => {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'} px-6 md:px-8 py-12`}
      >
        <div className='max-w-4xl mx-auto w-full'>
          <h1 className='text-3xl font-bold mb-8'>Privacy Policy</h1>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>1. Introduction</h2>
            <p className='mb-4'>
              This Privacy Policy explains how This For That (&quot;we,&quot; &quot;our,&quot;
              or &quot;us&quot;) collects, uses, shares, and protects user information in
              connection with our NFT trading social network platform. We are committed to
              protecting your privacy while providing a transparent and secure trading
              environment.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>2. Information We Collect</h2>
            <h3 className='text-lg font-medium mb-2'>2.1 Information You Provide</h3>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Wallet address</li>
              <li className='mb-2'>Profile information (username, bio, profile picture)</li>
              <li className='mb-2'>
                Content you post (including NFTs, comments, and messages)
              </li>
              <li className='mb-2'>Communication preferences</li>
            </ul>

            <h3 className='text-lg font-medium mb-2'>
              2.2 Automatically Collected Information
            </h3>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Transaction data on the blockchain</li>
              <li className='mb-2'>Device information (browser type, IP address)</li>
              <li className='mb-2'>Usage data (interactions, trading history)</li>
              <li className='mb-2'>Network information and metadata</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>3. How We Use Your Information</h2>
            <p className='mb-4'>We use collected information to:</p>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Facilitate NFT trades and transactions</li>
              <li className='mb-2'>Provide and improve social networking features</li>
              <li className='mb-2'>Maintain platform security</li>
              <li className='mb-2'>Customize user experience</li>
              <li className='mb-2'>Communicate platform updates</li>
              <li className='mb-2'>Comply with legal obligations</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>4. Blockchain Data</h2>
            <p className='mb-4'>
              Please note that transactions on the blockchain are public and permanently
              recorded. This includes:
            </p>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Wallet addresses involved in transactions</li>
              <li className='mb-2'>Transaction amounts and timestamps</li>
              <li className='mb-2'>Smart contract interactions</li>
              <li className='mb-2'>NFT ownership history</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>5. Information Sharing</h2>
            <p className='mb-4'>We may share your information with:</p>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Other users (according to your privacy settings)</li>
              <li className='mb-2'>Service providers who assist our operations</li>
              <li className='mb-2'>Law enforcement when required by law</li>
              <li className='mb-2'>Business partners (with your consent)</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>6. Your Privacy Rights</h2>
            <p className='mb-4'>You have the right to:</p>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Access your personal information</li>
              <li className='mb-2'>Update or correct your information</li>
              <li className='mb-2'>Delete your account and associated data</li>
              <li className='mb-2'>Control your privacy settings</li>
              <li className='mb-2'>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>7. Data Security</h2>
            <p className='mb-4'>
              We implement appropriate security measures to protect your information, including:
            </p>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Encryption of sensitive data</li>
              <li className='mb-2'>Regular security assessments</li>
              <li className='mb-2'>Access controls and authentication</li>
              <li className='mb-2'>Secure smart contract implementations</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>8. Children&apos;s Privacy</h2>
            <p className='mb-4'>
              Our platform is not intended for users under 18 years of age. We do not knowingly
              collect information from children.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>9. Cookies and Tracking</h2>
            <p className='mb-4'>
              We use cookies and similar technologies to enhance user experience and collect
              usage data. You can control cookie settings through your browser.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>10. International Data Transfers</h2>
            <p className='mb-4'>
              Your information may be transferred and processed in countries outside your
              residence. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>11. Changes to Privacy Policy</h2>
            <p className='mb-4'>
              We may update this Privacy Policy periodically. We will notify you of significant
              changes through the platform or email.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>12. Contact Us</h2>
            <p className='mb-4'>
              For privacy-related questions or concerns, please contact us at
              [contact@thisforthat.app]
            </p>
          </section>

          <p className='text-sm text-gray-600 mt-8'>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default PrivacyPage
