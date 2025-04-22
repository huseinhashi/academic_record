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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowRight, Shield, Mail } from "lucide-react";
import { LoaderCircle } from "@/components/LoaderCircle";

import { useToast } from "@/hooks/use-toast";

export const LoginPage = () => {
  const { loginWithWallet, loginWithPassword, isConnecting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("wallet");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const user = await loginWithPassword(email, password);
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      // Redirect based on user type
      if (user.userType === "Institution") {
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
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm border-opacity-50 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-2">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Academic Record System</CardTitle>
            <CardDescription className="text-muted-foreground">
              Securely access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="wallet">MetaMask Login</TabsTrigger>
                <TabsTrigger value="password">Email Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet" className="space-y-4 mt-4">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <p className="text-sm text-center">
                    Connect with your MetaMask wallet to securely access your account. 
                    Available for students and administrators only.
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
              </TabsContent>
              
              <TabsContent value="password" className="space-y-4 mt-4">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <p className="text-sm text-center">
                    Log in with your email and password. 
                    Available for institutions and companies.
                  </p>
                </div>
                
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    size="lg" 
                    className="w-full font-semibold h-12 text-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Log in with Email
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-4 border-t p-6">
            <div className="text-sm text-center">
              Don't have an account yet?
            </div>
            <Link to="/register" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                Create Student Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}; 