import type { NDAData } from '@/lib/types'

function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function plural(n: number, word: string) {
  return `${n} ${word}${n !== 1 ? 's' : ''}`
}

function CoverField({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded p-3">
      <div className="mb-1">
        <span className="font-semibold text-sm">{title}</span>
        {description && <span className="text-xs text-gray-500 ml-2">— {description}</span>}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export default function NDADocument({ data }: { data: NDAData }) {
  const {
    purpose,
    effectiveDate,
    mndaTermType,
    mndaTermYears,
    confidentialityTermType,
    confidentialityTermYears,
    governingLaw,
    jurisdiction,
    modifications,
    party1Name, party1Title, party1Company, party1Address,
    party2Name, party2Title, party2Company, party2Address,
  } = data

  const mndaTermText =
    mndaTermType === 'expires'
      ? `${plural(mndaTermYears, 'year')} from Effective Date`
      : 'until terminated in accordance with the terms of the MNDA'

  const confidentialityText =
    confidentialityTermType === 'years'
      ? `${plural(confidentialityTermYears, 'year')} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws`
      : 'in perpetuity'

  return (
    <div className="font-serif text-gray-900 leading-relaxed">
      {/* ── Cover Page ── */}
      <h1 className="text-2xl font-bold text-center mb-1">Mutual Non-Disclosure Agreement</h1>
      <p className="text-center text-xs text-gray-500 mb-6">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0)
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 text-xs text-gray-700">
        This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists of: (1) this Cover Page
        (&ldquo;Cover Page&rdquo;) and (2) the Common Paper Mutual NDA Standard Terms Version 1.0
        (&ldquo;Standard Terms&rdquo;) identical to those posted at{' '}
        <span className="font-medium">commonpaper.com/standards/mutual-nda/1.0</span>. Any
        modifications of the Standard Terms should be made on the Cover Page, which will control over
        conflicts with the Standard Terms.
      </div>

      <div className="space-y-3 mb-6">
        <CoverField title="Purpose" description="How Confidential Information may be used">
          <p>{purpose}</p>
        </CoverField>

        <CoverField title="Effective Date">
          <p>{formatDate(effectiveDate)}</p>
        </CoverField>

        <CoverField title="MNDA Term" description="The length of this MNDA">
          <ul className="space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-px">{mndaTermType === 'expires' ? '☑' : '☐'}</span>
              <span>
                Expires {plural(mndaTermYears, 'year')} from Effective Date.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-px">{mndaTermType === 'until-terminated' ? '☑' : '☐'}</span>
              <span>Continues until terminated in accordance with the terms of the MNDA.</span>
            </li>
          </ul>
        </CoverField>

        <CoverField
          title="Term of Confidentiality"
          description="How long Confidential Information is protected"
        >
          <ul className="space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-px">{confidentialityTermType === 'years' ? '☑' : '☐'}</span>
              <span>
                {plural(confidentialityTermYears, 'year')} from Effective Date, but in the case of
                trade secrets until Confidential Information is no longer considered a trade secret
                under applicable laws.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-px">{confidentialityTermType === 'perpetual' ? '☑' : '☐'}</span>
              <span>In perpetuity.</span>
            </li>
          </ul>
        </CoverField>

        <CoverField title="Governing Law & Jurisdiction">
          <p>
            <strong>Governing Law:</strong> {governingLaw}
          </p>
          <p className="mt-1">
            <strong>Jurisdiction:</strong> {jurisdiction}
          </p>
        </CoverField>

        <CoverField title="MNDA Modifications">
          <p>{modifications || 'None.'}</p>
        </CoverField>
      </div>

      <p className="text-sm mb-4">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective
        Date.
      </p>

      <table className="w-full border-collapse text-sm mb-4">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left w-36 bg-gray-50" />
            <th className="border border-gray-300 p-2 text-center bg-gray-50">PARTY 1</th>
            <th className="border border-gray-300 p-2 text-center bg-gray-50">PARTY 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 font-medium bg-gray-50">Signature</td>
            <td className="border border-gray-300 p-2 h-12" />
            <td className="border border-gray-300 p-2 h-12" />
          </tr>
          {[
            ['Print Name', party1Name, party2Name],
            ['Title', party1Title, party2Title],
            ['Company', party1Company, party2Company],
            ['Notice Address', party1Address, party2Address],
            ['Date', '', ''],
          ].map(([rowLabel, v1, v2]) => (
            <tr key={rowLabel}>
              <td className="border border-gray-300 p-2 font-medium bg-gray-50">{rowLabel}</td>
              <td className="border border-gray-300 p-2 whitespace-pre-wrap">{v1}</td>
              <td className="border border-gray-300 p-2 whitespace-pre-wrap">{v2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500 text-center mb-2">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.
      </p>

      {/* ── Standard Terms ── */}
      <div className="print-page-break">
        <h2 className="text-xl font-bold mb-6">Standard Terms</h2>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement (which incorporates
            these Standard Terms and the Cover Page (defined below)) (&ldquo;MNDA&rdquo;) allows each
            party (&ldquo;Disclosing Party&rdquo;) to disclose or make available information in
            connection with the <em>{purpose}</em> which (1) the Disclosing Party identifies to the
            receiving party (&ldquo;Receiving Party&rdquo;) as &ldquo;confidential&rdquo;,
            &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably understood as
            confidential or proprietary due to its nature and the circumstances of its disclosure
            (&ldquo;Confidential Information&rdquo;). Each party&rsquo;s Confidential Information also
            includes the existence and status of the parties&rsquo; discussions and information on the
            Cover Page. Confidential Information includes technical or business information, product
            designs or roadmaps, requirements, pricing, security and compliance documentation,
            technology, inventions and know-how. To use this MNDA, the parties must complete and sign a
            cover page incorporating these Standard Terms (&ldquo;Cover Page&rdquo;). Each party is
            identified on the Cover Page and capitalized terms have the meanings given herein or on the
            Cover Page.
          </p>

          <p>
            <strong>2. Use and Protection of Confidential Information.</strong> The Receiving Party
            shall: (a) use Confidential Information solely for the <em>{purpose}</em>; (b) not disclose
            Confidential Information to third parties without the Disclosing Party&rsquo;s prior written
            approval, except that the Receiving Party may disclose Confidential Information to its
            employees, agents, advisors, contractors and other representatives having a reasonable need
            to know for the <em>{purpose}</em>, provided these representatives are bound by
            confidentiality obligations no less protective of the Disclosing Party than the applicable
            terms in this MNDA and the Receiving Party remains responsible for their compliance with
            this MNDA; and (c) protect Confidential Information using at least the same protections the
            Receiving Party uses for its own similar information but no less than a reasonable standard
            of care.
          </p>

          <p>
            <strong>3. Exceptions.</strong> The Receiving Party&rsquo;s obligations in this MNDA do not
            apply to information that it can demonstrate: (a) is or becomes publicly available through
            no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from
            the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a
            third party without confidentiality restrictions; or (d) it independently developed without
            using or referencing the Confidential Information.
          </p>

          <p>
            <strong>4. Disclosures Required by Law.</strong> The Receiving Party may disclose
            Confidential Information to the extent required by law, regulation or regulatory authority,
            subpoena or court order, provided (to the extent legally permitted) it provides the
            Disclosing Party reasonable advance notice of the required disclosure and reasonably
            cooperates, at the Disclosing Party&rsquo;s expense, with the Disclosing Party&rsquo;s
            efforts to obtain confidential treatment for the Confidential Information.
          </p>

          <p>
            <strong>5. Term and Termination.</strong> This MNDA commences on the{' '}
            <em>{formatDate(effectiveDate)}</em> and expires at the end of the{' '}
            <em>{mndaTermText}</em>. Either party may terminate this MNDA for any or no reason upon
            written notice to the other party. The Receiving Party&rsquo;s obligations relating to
            Confidential Information will survive for the <em>{confidentialityText}</em>, despite any
            expiration or termination of this MNDA.
          </p>

          <p>
            <strong>6. Return or Destruction of Confidential Information.</strong> Upon expiration or
            termination of this MNDA or upon the Disclosing Party&rsquo;s earlier request, the
            Receiving Party will: (a) cease using Confidential Information; (b) promptly after the
            Disclosing Party&rsquo;s written request, destroy all Confidential Information in the
            Receiving Party&rsquo;s possession or control or return it to the Disclosing Party; and (c)
            if requested by the Disclosing Party, confirm its compliance with these obligations in
            writing. As an exception to subsection (b), the Receiving Party may retain Confidential
            Information in accordance with its standard backup or record retention policies or as
            required by law, but the terms of this MNDA will continue to apply to the retained
            Confidential Information.
          </p>

          <p>
            <strong>7. Proprietary Rights.</strong> The Disclosing Party retains all of its
            intellectual property and other rights in its Confidential Information and its disclosure to
            the Receiving Party grants no license under such rights.
          </p>

          <p>
            <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS
            IS&rdquo;, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF
            TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </p>

          <p>
            <strong>9. Governing Law and Jurisdiction.</strong> This MNDA and all matters relating
            hereto are governed by, and construed in accordance with, the laws of the State of{' '}
            <em>{governingLaw}</em>, without regard to the conflict of laws provisions of such{' '}
            <em>{governingLaw}</em>. Any legal suit, action, or proceeding relating to this MNDA must
            be instituted in the federal or state courts located in <em>{jurisdiction}</em>. Each party
            irrevocably submits to the exclusive jurisdiction of such <em>{jurisdiction}</em> in any
            such suit, action, or proceeding.
          </p>

          <p>
            <strong>10. Equitable Relief.</strong> A breach of this MNDA may cause irreparable harm for
            which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the
            Disclosing Party is entitled to seek appropriate equitable relief, including an injunction,
            in addition to its other remedies.
          </p>

          <p>
            <strong>11. General.</strong> Neither party has an obligation under this MNDA to disclose
            Confidential Information to the other or proceed with any proposed transaction. Neither
            party may assign this MNDA without the prior written consent of the other party, except that
            either party may assign this MNDA in connection with a merger, reorganization, acquisition
            or other transfer of all or substantially all its assets or voting securities. Any
            assignment in violation of this Section is null and void. This MNDA will bind and inure to
            the benefit of each party&rsquo;s permitted successors and assigns. Waivers must be signed
            by the waiving party&rsquo;s authorized representative and cannot be implied from conduct.
            If any provision of this MNDA is held unenforceable, it will be limited to the minimum
            extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover
            Page) constitutes the entire agreement of the parties with respect to its subject matter,
            and supersedes all prior and contemporaneous understandings, agreements, representations,
            and warranties, whether written or oral, regarding such subject matter. This MNDA may only
            be amended, modified, waived, or supplemented by an agreement in writing signed by both
            parties. Notices, requests and approvals under this MNDA must be sent in writing to the
            email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA
            may be executed in counterparts, including electronic copies, each of which is deemed an
            original and which together form the same agreement.
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 free to use under CC BY 4.0.
        </p>
      </div>
    </div>
  )
}
