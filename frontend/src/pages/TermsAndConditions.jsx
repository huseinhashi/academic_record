import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, Lock, AlertTriangle, CheckCircle } from "lucide-react";

export const TermsAndConditions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="text-muted-foreground">
          Please read these terms and conditions carefully before using our platform
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage Terms</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">1. Acceptance of Terms</h3>
                      <p className="text-muted-foreground mt-2">
                        By accessing and using this platform, you agree to be bound by these Terms and Conditions. 
                        If you do not agree to these terms, please do not use our services.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">2. Platform Services</h3>
                      <p className="text-muted-foreground mt-2">
                        Our platform provides blockchain-based academic record verification and job application services. 
                        We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">3. User Responsibilities</h3>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account</li>
                        <li>Comply with all applicable laws and regulations</li>
                        <li>Not engage in any fraudulent or malicious activities</li>
                        <li>Respect the privacy and rights of other users</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">4. Academic Records</h3>
                      <p className="text-muted-foreground mt-2">
                        Users are responsible for the accuracy of their academic records. 
                        Submitting false or misleading information may result in account suspension 
                        and legal consequences.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">5. Verification Process</h3>
                      <p className="text-muted-foreground mt-2">
                        Academic records undergo a verification process by authorized institutions. 
                        The verification status is clearly indicated on the platform. 
                        Users acknowledge that verification may take time and is subject to institutional review.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">6. Privacy and Data Protection</h3>
                      <p className="text-muted-foreground mt-2">
                        We are committed to protecting your privacy and handling your data in accordance 
                        with applicable data protection laws. Our Privacy Policy details how we collect, 
                        use, and protect your information.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">7. Intellectual Property</h3>
                      <p className="text-muted-foreground mt-2">
                        All content, features, and functionality of the platform are owned by us and 
                        are protected by international copyright, trademark, and other intellectual 
                        property laws.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">8. Limitation of Liability</h3>
                      <p className="text-muted-foreground mt-2">
                        We shall not be liable for any indirect, incidental, special, consequential, 
                        or punitive damages resulting from your use of or inability to use the platform.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">9. Changes to Terms</h3>
                      <p className="text-muted-foreground mt-2">
                        We reserve the right to modify these terms at any time. Users will be notified 
                        of significant changes. Continued use of the platform after changes constitutes 
                        acceptance of the new terms.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">10. Contact Information</h3>
                      <p className="text-muted-foreground mt-2">
                        For questions about these Terms and Conditions, please contact our support team 
                        at rayanjust@gmail.com
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 