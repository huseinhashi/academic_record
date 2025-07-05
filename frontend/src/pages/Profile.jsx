import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Building2,
  School,
  GraduationCap,
  Shield,
  Wallet,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export const Profile = () => {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    wallet: "",
    userType: "",
    isVerifiedByAdmin: false,
    createdAt: "",
    // Company specific fields
    companyName: "",
    industry: "",
    website: "",
    description: "",
    // Institution specific fields
    institutionName: "",
    institutionType: "",
    accreditation: "",
    // Student specific fields
    firstName: "",
    lastName: "",
    roleNumber: "",
    skills: [],
    graduationYear: "",
    major: "",
  });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        wallet: user.wallet || "",
        userType: user.userType || "",
        isVerifiedByAdmin: user.isVerifiedByAdmin || false,
        createdAt: user.createdAt || "",
        // Company specific fields
        companyName: user.companyName || "",
        industry: user.industry || "",
        website: user.website || "",
        description: user.description || "",
        // Institution specific fields
        institutionName: user.institutionName || "",
        institutionType: user.institutionType || "",
        accreditation: user.accreditation || "",
        // Student specific fields
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        roleNumber: user.roleNumber || "",
        skills: user.skills || [],
        graduationYear: user.graduationYear || "",
        major: user.major || "",
      });
    }
  }, [user]);
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      const response = await api.put("/users/profile", profileData);
      
      if (response.data.success) {
        // Update the user context with new data
        updateUser(response.data.data);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        wallet: user.wallet || "",
        userType: user.userType || "",
        isVerifiedByAdmin: user.isVerifiedByAdmin || false,
        createdAt: user.createdAt || "",
        companyName: user.companyName || "",
        industry: user.industry || "",
        website: user.website || "",
        description: user.description || "",
        institutionName: user.institutionName || "",
        institutionType: user.institutionType || "",
        accreditation: user.accreditation || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        roleNumber: user.roleNumber || "",
        skills: user.skills || [],
        graduationYear: user.graduationYear || "",
        major: user.major || "",
      });
    }
    setEditing(false);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const shortenWallet = (address) => {
    if (!address) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case "Student":
        return <GraduationCap className="h-5 w-5" />;
      case "Company":
        return <Building2 className="h-5 w-5" />;
      case "Institution":
        return <School className="h-5 w-5" />;
      case "Admin":
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };
  
  const getVerificationBadge = () => {
    if (profileData.isVerifiedByAdmin) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending Verification
        </Badge>
      );
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and settings
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getUserTypeIcon(profileData.userType)}
              Basic Information
            </CardTitle>
            <CardDescription>
              Your account details and verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="text-sm">{profileData.name || "N/A"}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {editing ? (
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm">{profileData.email || "N/A"}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <p className="text-sm font-mono">{shortenWallet(profileData.wallet)}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <div className="flex items-center gap-2">
                {getUserTypeIcon(profileData.userType)}
                <span className="text-sm font-medium">{profileData.userType}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Verification Status</Label>
              {getVerificationBadge()}
            </div>
            
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm">{formatDate(profileData.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* User Type Specific Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {profileData.userType === "Student" && "Student Information"}
              {profileData.userType === "Company" && "Company Information"}
              {profileData.userType === "Institution" && "Institution Information"}
              {profileData.userType === "Admin" && "Administrator Information"}
            </CardTitle>
            <CardDescription>
              {profileData.userType === "Student" && "Your academic and personal details"}
              {profileData.userType === "Company" && "Your company profile and details"}
              {profileData.userType === "Institution" && "Your institution profile and details"}
              {profileData.userType === "Admin" && "Administrator account details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.userType === "Student" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {editing ? (
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm">{profileData.firstName || "N/A"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {editing ? (
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm">{profileData.lastName || "N/A"}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleNumber">Student ID</Label>
                  {editing ? (
                    <Input
                      id="roleNumber"
                      value={profileData.roleNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, roleNumber: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.roleNumber || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study</Label>
                  {editing ? (
                    <Input
                      id="major"
                      value={profileData.major}
                      onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.major || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  {editing ? (
                    <Input
                      id="graduationYear"
                      type="number"
                      value={profileData.graduationYear}
                      onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.graduationYear || "N/A"}</p>
                  )}
                </div>
              </>
            )}
            
            {profileData.userType === "Company" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  {editing ? (
                    <Input
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.companyName || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  {editing ? (
                    <Input
                      id="industry"
                      value={profileData.industry}
                      onChange={(e) => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.industry || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  {editing ? (
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.website || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  {editing ? (
                    <Textarea
                      id="description"
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{profileData.description || "N/A"}</p>
                  )}
                </div>
              </>
            )}
            
            {profileData.userType === "Institution" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  {editing ? (
                    <Input
                      id="institutionName"
                      value={profileData.institutionName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, institutionName: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.institutionName || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institutionType">Institution Type</Label>
                  {editing ? (
                    <Select
                      value={profileData.institutionType}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, institutionType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="institute">Institute</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{profileData.institutionType || "N/A"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accreditation">Accreditation</Label>
                  {editing ? (
                    <Input
                      id="accreditation"
                      value={profileData.accreditation}
                      onChange={(e) => setProfileData(prev => ({ ...prev, accreditation: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{profileData.accreditation || "N/A"}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 