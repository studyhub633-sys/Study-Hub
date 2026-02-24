import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Website Terms and Conditions of Use
            </h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: February 2026
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="glass-card p-8 space-y-6 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>

            {/* 1. About us and these terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. About us and these terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                1.1 These Terms and Conditions ("Terms") govern your access to and use of the REVISELY website, web application and related services located at www.revisely.ai (the "Website") and any content, materials, products or services offered through it (together, the "Services").
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                1.2 The Website is operated by REVISELY LTD, a company registered in the United Kingdom with company number 17046803 and registered office at 61 Bridge Street, Kington, HR5 3DJ ("REVISELY", "we", "us", "our").
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                1.3 By accessing or using the Website or Services, you agree to be bound by these Terms. If you do not agree, you must not use the Website or Services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                1.4 We may revise these Terms from time to time. The latest version will always be available on the Website and will apply from the date of publication. If you continue to use the Website after changes are posted, you will be deemed to have accepted the updated Terms.
              </p>
            </section>

            {/* 2. Eligibility and accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Eligibility and accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                2.1 You must be at least 13 years old, or have the consent of a parent or legal guardian, to create an account and use the Services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                2.2 When you create an account, you must provide accurate, current and complete information and keep this information up to date.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                2.3 You are responsible for maintaining the confidentiality of your login details (including username and password) and for all activities that occur under your account. You must not share your account details with anyone else.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                2.4 We reserve the right to suspend, restrict or terminate any account at any time if, in our reasonable opinion, you have breached these Terms, created risk or possible legal exposure for us, or for any other reasonable business purpose.
              </p>
            </section>

            {/* 3. Subscription services and payments */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Subscription services and payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                3.1 Certain content and features on REVISELY are available only to paying subscribers ("Subscription"). Details of Subscription plans, pricing and term lengths are described on the Website from time to time.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                3.2 By starting a Subscription, you authorise us and our third‑party payment processors (including PayPal, Wise and Stripe) to charge you the Subscription fee and any applicable taxes at the rate notified to you at the time of purchase.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                3.3 Unless otherwise stated, Subscriptions are provided on a recurring basis (e.g. monthly, termly, annually) and will automatically renew at the end of each billing period, using the payment method you provided, until you cancel.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                3.4 You can cancel your Subscription at any time via your account settings or by contacting us at hello@revisely.ai. Cancellation will take effect at the end of your current billing period, and you will retain access to paid features until that date. We do not provide pro‑rated refunds for unused periods unless required by applicable law or explicitly stated otherwise in writing.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                3.5 We may change our Subscription prices or structure from time to time. Any changes will take effect at the start of your next billing period and we will give you reasonable prior notice where required. If you do not agree to the change, you may cancel your Subscription before the new price takes effect.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                3.6 You are responsible for ensuring that your payment information is correct and that you have sufficient funds or credit available. If payment is not successfully processed, we may suspend or terminate your Subscription and/or account.
              </p>
            </section>

            {/* 4. Use of the Website and Services */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Use of the Website and Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                4.1 The Website and Services are provided for personal, non‑commercial use for educational and revision purposes only, unless we expressly agree otherwise in writing.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                4.2 You agree that you will not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>Use the Website for any unlawful purpose or in breach of any applicable local, national or international law or regulation.</li>
                <li>Copy, reproduce, distribute, sell, resell, or exploit any part of the Website or its content for commercial purposes without our prior written consent.</li>
                <li>Attempt to circumvent or bypass any access or usage restrictions or security measures on the Website.</li>
                <li>Upload, post or transmit any content that is unlawful, defamatory, obscene, harassing, discriminatory, infringing or otherwise objectionable.</li>
                <li>Use any automated system, including "bots," "scrapers" or similar technologies, to access the Website without our prior written permission, except for bona fide search engine indexing.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                4.3 We may monitor use of the Website and remove or disable access to any content that we reasonably believe breaches these Terms or applicable law.
              </p>
            </section>

            {/* 5. Intellectual property */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual property</h2>
              <p className="text-muted-foreground leading-relaxed">
                5.1 All content on the Website, including (without limitation) text, questions, model answers, explanations, diagrams, videos, images, graphics, logos, icons, user interface design and software code, is owned by or licensed to REVISELY and is protected by copyright, trade marks and other intellectual property rights.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                5.2 Subject to your compliance with these Terms and payment of any applicable Subscription fees, we grant you a limited, non‑exclusive, non‑transferable, revocable licence to access and use the Website and Services for your own personal, non‑commercial educational use only.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                5.3 You must not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>Copy, reproduce, modify, adapt, translate, create derivative works of, distribute, transmit, sell, lease, or otherwise exploit the content or any part of the Website, except as expressly permitted in these Terms.</li>
                <li>Remove, alter or obscure any copyright, trade mark or other proprietary rights notices on the Website or in any of its content.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                5.4 All trade marks, logos and trade names displayed on the Website (including "REVISELY" and any related marks) are the property of REVISELY or their respective owners. You may not use these marks without our prior written consent.
              </p>
            </section>

            {/* 6. User-generated content */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. User‑generated content</h2>
              <p className="text-muted-foreground leading-relaxed">
                6.1 You may be able to submit, upload, post or otherwise share content on or through the Website (for example, comments, questions, answers, notes or other materials) ("User Content").
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                6.2 You remain the owner of any intellectual property rights you hold in your User Content. However, by submitting User Content, you grant REVISELY a worldwide, non‑exclusive, royalty‑free, transferable, sub‑licensable licence to use, host, store, reproduce, modify, create derivative works of, communicate, publish, publicly display and distribute your User Content in connection with operating, improving and promoting the Website and Services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                6.3 You are solely responsible for your User Content and for ensuring that it:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>Is accurate and not misleading.</li>
                <li>Does not infringe any copyright, trade mark, moral right, privacy, data protection or other rights of any third party.</li>
                <li>Is lawful and not defamatory, obscene, harassing, hateful, discriminatory or otherwise objectionable.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                6.4 We may remove or disable access to any User Content at any time, without notice, if we reasonably believe it breaches these Terms or applicable law.
              </p>
            </section>

            {/* 7. No guarantee of exam results */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. No guarantee of exam results</h2>
              <p className="text-muted-foreground leading-relaxed">
                7.1 REVISELY provides revision resources, practice questions, model answers, explanations and related content for educational support only.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                7.2 We do not guarantee that use of the Website or Services will result in any particular exam grade, academic outcome, admission to an institution, or other result.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                7.3 You remain responsible for your own learning, exam preparation and performance, including checking that any materials are suitable for your specific exam board, syllabus and year.
              </p>
            </section>

            {/* 8. Availability, changes and suspension */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Availability, changes and suspension</h2>
              <p className="text-muted-foreground leading-relaxed">
                8.1 We do not guarantee that the Website or any content will always be available or uninterrupted. We may suspend, withdraw or restrict the availability of all or any part of the Website for business or operational reasons.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                8.2 We may update or change the Website, the Services or any content at any time, for example to reflect changes to our users' needs, exam specifications, or our business priorities.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                8.3 We will try to give you reasonable notice of any significant changes that materially affect your existing Subscription, where practicable.
              </p>
            </section>

            {/* 9. Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed">
                9.1 The Website and Services are provided on an "as is" and "as available" basis and are intended for general information and educational purposes only.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                9.2 To the fullest extent permitted by law, we disclaim all warranties, representations or conditions, whether express or implied, including (without limitation) implied warranties of satisfactory quality, fitness for a particular purpose, accuracy, completeness and non‑infringement.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                9.3 While we take reasonable steps to ensure that content is accurate and up to date, we do not warrant that any content is complete, current or error‑free, or that it will always reflect the latest exam specifications or mark schemes.
              </p>
            </section>

            {/* 10. Limitation of liability */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                10.1 Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under applicable law, including liability for death or personal injury caused by our negligence, or for fraud or fraudulent misrepresentation.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                10.2 Subject to clause 10.1, we shall not be liable to you, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, arising out of or in connection with these Terms, for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>Any loss of profits, loss of revenue, loss of anticipated savings, loss of business or loss of opportunity.</li>
                <li>Any loss of data, corruption of data, or loss of goodwill or reputation.</li>
                <li>Any indirect or consequential loss or damage.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                10.3 Subject to clause 10.1, our total aggregate liability to you in respect of all losses arising under or in connection with your use of the Website and Services shall in no circumstances exceed the greater of (a) the total amount you have paid to us in Subscription fees in the twelve (12) months preceding the event giving rise to the claim, and (b) £100.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                10.4 You are responsible for ensuring that your devices and software are compatible with the Website and for implementing appropriate security measures (such as anti‑virus software and secure passwords).
              </p>
            </section>

            {/* 11. Indemnity */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Indemnity</h2>
              <p className="text-muted-foreground leading-relaxed">
                11.1 You agree to indemnify and hold harmless REVISELY, its directors, officers, employees and contractors from and against any and all claims, liabilities, damages, losses, costs and expenses (including reasonable legal fees) arising out of or in connection with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>Your breach of these Terms.</li>
                <li>Your use of the Website or Services.</li>
                <li>Your User Content.</li>
              </ul>
            </section>

            {/* 12. Third-party links and services */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Third‑party links and services</h2>
              <p className="text-muted-foreground leading-relaxed">
                12.1 The Website may contain links to third‑party websites or services that are not owned or controlled by us.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                12.2 We have no control over, and assume no responsibility for, the content, privacy policies or practices of any third‑party websites or services. You access any third‑party sites at your own risk.
              </p>
            </section>

            {/* 13. Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                13.1 We may suspend or terminate your access to the Website or any part of the Services at any time if you materially breach these Terms, misuse the Website, or if required to do so by law or regulatory authority.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                13.2 Upon termination, your right to use the Services will immediately cease. Any provisions of these Terms which by their nature should reasonably survive termination shall survive, including but not limited to clauses relating to intellectual property, liability, indemnity and governing law.
              </p>
            </section>

            {/* 14. Governing law and jurisdiction */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Governing law and jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                14.1 These Terms, their subject matter and their formation are governed by the laws of England and Wales.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                14.2 You and we agree that the courts of England and Wales shall have exclusive jurisdiction to resolve any dispute or claim arising out of or in connection with these Terms or your use of the Website, except that if you are a consumer resident in another part of the UK, you may bring proceedings in your local courts as required by consumer law.
              </p>
            </section>

            {/* 15. Contact us */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact us</h2>
              <p className="text-muted-foreground leading-relaxed">
                15.1 If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none space-y-1 text-muted-foreground ml-4 mt-2">
                <li><strong>Email:</strong> hello@revisely.ai</li>
                <li><strong>Postal address:</strong> 61 Bridge Street, Kington, HR5 3DJ</li>
              </ul>
            </section>

          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}






