import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Wallet, ArrowRight } from "lucide-react";
import { LoaderCircle } from "@/components/LoaderCircle";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const LoginPage = () => {
  const { loginWithWallet, isConnecting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleWalletLogin = async () => {
    if (loading || isConnecting) return;
    
    setLoading(true);
    try {
      const user = await loginWithWallet();
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      // Redirect based on user type
      if (user.userType === "Admin") {
        navigate("/admin/dashboard");
      } else if (user.userType === "Student") {
        navigate("/student/dashboard");
      } else if (user.userType === "Institution") {
        navigate("/institution/dashboard");
      } else if (user.userType === "Company") {
        navigate("/company/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/10 px-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm border-opacity-50 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="Hiigsi Forum Logo" className="h-24 w-24 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Hiigsi Forum</CardTitle>
            <CardDescription className="text-muted-foreground">
              Connect with MetaMask to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm text-center">
                Connect with your MetaMask wallet to securely access your account.
                Available for all user types: Students, Institutions, Companies, and Administrators.
              </p>
            </div>
            
            <Button 
              size="lg" 
              className="w-full font-semibold h-12 text-md"
              onClick={handleWalletLogin}
              disabled={loading || isConnecting}
            >
              {(loading || isConnecting) ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect with MetaMask
                </>
              )}
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-4 border-t p-6">
            <div className="text-sm text-center">
              Don't have an account yet?
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Link to="/register?type=student" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Graduate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register?type=institution" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Institution
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register?type=company" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Company
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}; 