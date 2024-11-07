'use client'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'

const TermsPage = () => {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'} px-6 md:px-8 py-12`}
      >
        <div className='max-w-4xl mx-auto w-full'>
          <h1 className='text-3xl font-bold mb-8'>Terms and Conditions</h1>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>1. Acceptance of Terms</h2>
            <p className='mb-4'>
              By accessing or using This For That (the `&quot;Platform`&quot;), you agree to be
              bound by these Terms and Conditions. If you do not agree to these terms, please do
              not use the Platform.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>2. Platform Overview</h2>
            <p className='mb-4'>
              This For That is a social network platform for NFT trading. All trades are
              executed through smart contracts on the blockchain. The Platform provides features
              including but not limited to: account creation, social networking, NFT posting,
              and messaging.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>3. Account Registration</h2>
            <p className='mb-4'>
              3.1. To use the Platform, you must create an account via a valid Google account.
              <br />
              3.2. You must be at least 18 years old to use the Platform.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>4. NFT Trading</h2>
            <p className='mb-4'>
              4.1. All trades are final and executed through smart contracts.
              <br />
              4.2. You acknowledge that you understand the risks associated with cryptocurrency
              and NFT trading.
              <br />
              4.3. The Platform does not guarantee the value or authenticity of NFTs.
              <br />
              4.4. You are responsible for verifying all transaction details before approval.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>5. User Conduct</h2>
            <p className='mb-4'>Users agree not to:</p>
            <ul className='list-disc pl-6 mb-4'>
              <li className='mb-2'>Post illegal or unauthorized content</li>
              <li className='mb-2'>Impersonate others or provide false information</li>
              <li className='mb-2'>Engage in market manipulation or fraudulent activity</li>
              <li className='mb-2'>Harass or abuse other users</li>
              <li className='mb-2'>Interfere with the Platform&apos;s security features</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>6. Intellectual Property</h2>
            <p className='mb-4'>
              6.1. Users retain rights to their original content.
              <br />
              6.2. By posting content, you grant the Platform a license to display and
              distribute it.
              <br />
              6.3. You must respect intellectual property rights of others.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>7. Privacy and Data</h2>
            <p className='mb-4'>
              7.1. Public blockchain data is visible to all users.
              <br />
              7.2. Profile information and messages are stored according to our Privacy Policy.
              <br />
              7.3. You control what personal information to share publicly.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>8. Disclaimer of Warranties</h2>
            <p className='mb-4'>
              The Platform is provided &quot;as is&quot; without warranties of any kind. We do
              not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>9. Limitation of Liability</h2>
            <p className='mb-4'>
              The Platform shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use or inability to use the
              service.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>10. Modifications</h2>
            <p className='mb-4'>
              We reserve the right to modify these terms at any time. Continued use of the
              Platform after changes constitutes acceptance of modified terms.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>11. Contact</h2>
            <p className='mb-4'>
              For questions about these Terms, please contact us at [contact@thisforthat.app].
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

export default TermsPage
