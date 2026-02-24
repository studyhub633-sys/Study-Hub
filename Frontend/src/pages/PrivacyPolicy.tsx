import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto animate-fade-in pb-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/landing">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        <p className="text-muted-foreground">
                            Last updated: February 2026
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Privacy Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert">

                        {/* 1. Who we are */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">1. Who we are</h3>
                        <p className="text-muted-foreground">
                            1.1 This Privacy Policy explains how REVISELY ("we", "us", "our") collects, uses, discloses and protects your personal data when you visit www.revisely.ai, create an account, use our revision platform and subscription services, or otherwise interact with us.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            1.2 We are the data controller for the purposes of the UK General Data Protection Regulation ("UK GDPR") and the Data Protection Act 2018. Our contact details are: REVISELY LTD, 61 Bridge Street, Kington, HR5 3DJ, hello@revisely.ai.
                        </p>

                        {/* 2. Personal data we collect */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">2. Personal data we collect</h3>
                        <p className="text-muted-foreground">We may collect the following types of personal data:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li><strong>Identification and contact details:</strong> name, email address, username, password, school/college, year group, and (where provided) phone number.</li>
                            <li><strong>Account and usage information:</strong> courses/subjects selected, revision history, performance data (such as scores on practice questions), saved resources, preferences and settings.</li>
                            <li><strong>Subscription and billing information:</strong> partial payment card information (handled by our payment processor), billing address, transaction history.</li>
                            <li><strong>Technical data:</strong> IP address, device identifiers, browser type and version, time zone setting, operating system, and information about how you use and navigate our Website (e.g. pages viewed, clicks, session duration).</li>
                            <li><strong>Communications data:</strong> records of messages you send us (email, support tickets, feedback, survey responses).</li>
                        </ul>

                        {/* 3. How we collect your personal data */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">3. How we collect your personal data</h3>
                        <p className="text-muted-foreground">We collect personal data in the following ways:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li><strong>Directly from you</strong> when you create an account, sign up for a Subscription, complete forms, contact us, or participate in surveys and feedback.</li>
                            <li><strong>Automatically</strong> when you use the Website, through cookies, pixels and similar tracking technologies.</li>
                            <li><strong>From third parties</strong> such as payment processors, analytics providers and login providers (if we offer single sign‑on via Google, Apple, Microsoft or others).</li>
                        </ul>

                        {/* 4. Legal bases for processing */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">4. Legal bases for processing (UK GDPR)</h3>
                        <p className="text-muted-foreground">We rely on the following legal bases under the UK GDPR to process your personal data:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li><strong>Contract:</strong> To create and manage your account, provide our Services, process payments and fulfil our obligations under our contract with you.</li>
                            <li><strong>Legitimate interests:</strong> To operate, secure and improve the Website, personalise content, analyse usage, prevent fraud and enforce our rights, provided these interests are not overridden by your rights and interests.</li>
                            <li><strong>Consent:</strong> Where we send you marketing communications by email or use non‑essential cookies and similar technologies, we will rely on your consent. You may withdraw your consent at any time.</li>
                            <li><strong>Legal obligation:</strong> To comply with our legal and regulatory obligations (e.g. accounting, taxation, responding to lawful requests from authorities).</li>
                        </ul>

                        {/* 5. How we use your personal data */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">5. How we use your personal data</h3>
                        <p className="text-muted-foreground">We use your personal data to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li>Provide, operate and maintain the Website and Services.</li>
                            <li>Create and manage your account and Subscription.</li>
                            <li>Personalise your learning experience (e.g. recommended questions, progress tracking, tailored revision suggestions).</li>
                            <li>Process payments and manage billing, refunds and renewals.</li>
                            <li>Communicate with you about your account, technical issues, changes to our Terms or policies, and service updates.</li>
                            <li>Send you marketing communications (where permitted) about new features, content and offers that may interest you.</li>
                            <li>Monitor and improve the performance, security and user experience of the Website.</li>
                            <li>Detect, prevent and investigate fraud, abuse, violations of our Terms or other harmful activity.</li>
                            <li>Comply with legal obligations and respond to requests from regulators or law enforcement agencies where required.</li>
                        </ul>

                        {/* 6. Cookies and similar technologies */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">6. Cookies and similar technologies</h3>
                        <p className="text-muted-foreground">
                            6.1 We use cookies and similar technologies on the Website to:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li>Remember your preferences and keep you logged in.</li>
                            <li>Understand how you use the Website and improve our Services.</li>
                            <li>Provide and measure the effectiveness of advertising and marketing (where used).</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                            6.2 Essential cookies are necessary for the Website to function and are set automatically. Non‑essential cookies (such as analytics or advertising cookies) will only be used with your consent, where required by law.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            6.3 You can manage your cookie preferences through our cookie banner or your browser settings. Blocking certain cookies may affect the functionality of the Website.
                        </p>

                        {/* 7. Who we share your personal data with */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">7. Who we share your personal data with</h3>
                        <p className="text-muted-foreground">We may share your personal data with:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li><strong>Service providers:</strong> third‑party vendors who provide services such as hosting, cloud storage, analytics, email delivery, customer support, and payment processing. These providers are only permitted to process your data on our instructions and must protect it appropriately.</li>
                            <li><strong>Professional advisers:</strong> lawyers, accountants, auditors and insurers, where necessary for the operation of our business.</li>
                            <li><strong>Authorities and regulators:</strong> where required to do so by law, regulation, court order or a lawful request from law enforcement.</li>
                            <li><strong>Successors:</strong> in connection with any merger, acquisition, restructuring or sale of some or all of our assets, your personal data may be transferred to the relevant third party as part of the transaction.</li>
                        </ul>
                        <p className="text-muted-foreground mt-2 font-medium">
                            We do not sell your personal data.
                        </p>

                        {/* 8. International transfers */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">8. International transfers</h3>
                        <p className="text-muted-foreground">
                            8.1 Some of our service providers may be located outside the UK (and the European Economic Area).
                        </p>
                        <p className="text-muted-foreground mt-2">
                            8.2 Where we transfer your personal data outside the UK, we will ensure that appropriate safeguards are in place, such as:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li>An adequacy regulation issued by the UK government; or</li>
                            <li>Standard contractual clauses approved by the UK or EU authorities, together with supplementary measures where required.</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                            8.3 You can contact us for more information about the safeguards we use for international transfers.
                        </p>

                        {/* 9. Data retention */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">9. Data retention</h3>
                        <p className="text-muted-foreground">
                            9.1 We keep your personal data only for as long as reasonably necessary for the purposes described in this Privacy Policy, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.
                        </p>
                        <p className="text-muted-foreground mt-2">9.2 In general:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li>Account data is kept for as long as your account remains active and for 2 years after closure, unless we are required or permitted by law to retain it longer.</li>
                            <li>Billing records are kept for up to 5 years to comply with tax and accounting obligations.</li>
                            <li>Technical and analytics data is kept for shorter periods where possible and aggregated or anonymised once no longer needed in identifiable form.</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                            9.3 When personal data is no longer required, we will securely delete or anonymise it.
                        </p>

                        {/* 10. Data security */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">10. Data security</h3>
                        <p className="text-muted-foreground">
                            10.1 We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, disclosure, alteration or destruction. These measures may include encryption in transit, access controls, secure development practices and regular security reviews.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            10.2 No system is completely secure, and we cannot guarantee absolute security of your data. You are responsible for keeping your account password confidential and for notifying us promptly if you suspect any unauthorised access to your account.
                        </p>

                        {/* 11. Your rights */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">11. Your rights</h3>
                        <p className="text-muted-foreground">Under data protection laws (including the UK GDPR), you may have the following rights:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li><strong>Right of access:</strong> to obtain a copy of your personal data and information about how we process it.</li>
                            <li><strong>Right to rectification:</strong> to have inaccurate or incomplete personal data corrected.</li>
                            <li><strong>Right to erasure:</strong> to request deletion of your personal data in certain circumstances.</li>
                            <li><strong>Right to restriction:</strong> to request that we restrict the processing of your personal data in certain circumstances.</li>
                            <li><strong>Right to data portability:</strong> to receive your personal data in a structured, commonly used and machine‑readable format, and to transmit it to another controller where technically feasible.</li>
                            <li><strong>Right to object:</strong> to object to processing based on legitimate interests or to direct marketing at any time.</li>
                            <li><strong>Right to withdraw consent:</strong> where we rely on consent, you may withdraw it at any time (this will not affect the lawfulness of processing before withdrawal).</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                            To exercise any of these rights, please contact us at hello@revisely.ai. We may need to verify your identity before responding.
                        </p>

                        {/* 12. Children's privacy */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">12. Children's privacy</h3>
                        <p className="text-muted-foreground">
                            12.1 Our Services are intended for students, some of whom may be under 18. Where required by law, we may seek consent from a parent or legal guardian before collecting or processing personal data of users below a certain age.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            12.2 If you are a parent or guardian and believe your child has provided us with personal data without your consent, please contact us and we will take appropriate steps to review and, where necessary, delete such information.
                        </p>

                        {/* 13. Marketing communications */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">13. Marketing communications</h3>
                        <p className="text-muted-foreground">
                            13.1 Where permitted by law and, where required, with your consent, we may send you marketing emails about our Services, new features, content and offers.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            13.2 You can opt‑out of marketing emails at any time by clicking the unsubscribe link in any email or by contacting us. Even if you opt‑out of marketing, we may still send you non‑marketing communications, such as service or account notices.
                        </p>

                        {/* 14. Third-party sites */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">14. Third‑party sites</h3>
                        <p className="text-muted-foreground">
                            14.1 The Website may contain links to third‑party websites or services. This Privacy Policy does not apply to those third‑party sites, and we are not responsible for their privacy practices.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            14.2 We encourage you to review the privacy policies of any third‑party sites you visit.
                        </p>

                        {/* 15. Changes to this Privacy Policy */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">15. Changes to this Privacy Policy</h3>
                        <p className="text-muted-foreground">
                            15.1 We may update this Privacy Policy from time to time. The latest version will be posted on the Website with an updated "last revised" date.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            15.2 If we make material changes, we may notify you by email or by a prominent notice on the Website. Your continued use of the Website after any changes become effective will constitute your acceptance of the updated Privacy Policy.
                        </p>

                        {/* 16. Contact and complaints */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">16. Contact and complaints</h3>
                        <p className="text-muted-foreground">
                            16.1 If you have any questions, concerns or requests regarding this Privacy Policy or our data protection practices, please contact us at:
                        </p>
                        <ul className="list-none pl-6 mt-2 space-y-1 text-muted-foreground">
                            <li><strong>Email:</strong> hello@revisely.ai</li>
                            <li><strong>Postal address:</strong> 61 Bridge Street, Kington, HR5 3DJ</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                            16.2 You also have the right to lodge a complaint with your local data protection authority. In the UK, this is the Information Commissioner's Office (ICO) at{" "}
                            <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ico.org.uk</a>.
                        </p>

                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
