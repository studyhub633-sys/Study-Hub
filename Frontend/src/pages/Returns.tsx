import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";

export default function Returns() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Returns and Refunds Policy
            </h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Digital Services Refund Policy</CardTitle>
                <CardDescription>
                  Scientia.ai provides digital subscription services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Since Scientia.ai is a digital service providing access to online study tools and features,
                  we operate under specific refund policies designed for digital products.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium Subscription Refunds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-muted-foreground">
                  <h3 className="font-semibold text-foreground">14-Day Money-Back Guarantee</h3>
                  <p>
                    If you're not satisfied with your Premium subscription, you may request a full refund within
                    14 days of your initial purchase. This guarantee applies to your first subscription only.
                  </p>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <h3 className="font-semibold text-foreground">How to Request a Refund</h3>
                  <p>
                    To request a refund, please contact our support team through the Settings page or email us directly.
                    Include your account email and the reason for your refund request. Refunds will be processed within
                    5-10 business days to your original payment method.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  You may cancel your Premium subscription at any time from your account settings. Cancellation will
                  take effect at the end of your current billing period. You will continue to have access to Premium
                  features until the end of your paid period.
                </p>
                <p>
                  <strong className="text-foreground">Important:</strong> Cancelling your subscription does not automatically
                  entitle you to a refund for the current billing period. Refunds are only available within the 14-day
                  money-back guarantee period for new subscriptions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Refundable Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>The following are not eligible for refunds:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Subscriptions cancelled after the 14-day guarantee period</li>
                  <li>Partial refunds for unused portions of subscription periods</li>
                  <li>Free tier services (no payment required)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>
                  Once your refund request is approved, we will process the refund to your original payment method.
                  Processing times may vary:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Credit/Debit Cards: 5-10 business days</li>
                  <li>PayPal: 3-5 business days</li>
                </ul>
                <p className="mt-4">
                  You will receive an email confirmation once the refund has been processed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  If you have questions about our refund policy or need assistance with a refund request, please
                  contact our support team through the Settings page or visit our FAQ section.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}





