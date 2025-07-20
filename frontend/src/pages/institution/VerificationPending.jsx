import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, CheckCircle2, AlertCircle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const InstitutionVerificationPending = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-amber-50 rounded-full">
              <GraduationCap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>Institution Verification Pending</CardTitle>
              <CardDescription>
                Your academic institution account is currently under review
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Verification in Progress</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our team is reviewing your institution's credentials to ensure the authenticity of academic records.
                  This process typically takes 2-3 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">What You Can Do Now</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                  <li>Review  your institution profile</li>
                  <li>Prepare your academic record templates</li>
                  <li>Familiarize yourself with the blockchain verification process</li>
                  <li>Review the platform's academic record guidelines</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Required Documents</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Make sure you have submitted all necessary documents for verification:
                </p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                  <li>Institution registration and accreditation documents</li>
                  <li>Official letter of authorization</li>
                  <li>Academic department verification</li>
                  <li>Contact information for authorized personnel</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">After Verification</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                  <li>Issue verified academic records and certificates</li>
                  <li>Manage student records and verifications</li>
                  <li>Access blockchain verification tools</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Need assistance? Contact our academic support team</p>
            <p className="mt-1">rayanjust@gmail.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 