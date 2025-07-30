import { useState } from "react";
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
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Clock,
  MapPin,
  HelpCircle,
  FileText,
  Users,
  Shield,
  BookOpen,
  ExternalLink,
  MessageSquare,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const HelpSupport = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("contact");

  // Contact information
  const contactInfo = {
    whatsapp: {
      number: "+252612480687",
      display: "+252612480687",
      link: "https://wa.me/+252612480687"
    },
    email: {
             support: "support@hiigsiforum.com",
       technical: "tech@hiigsiforum.com",
       general: "info@hiigsiforum.com"
    },
    phone: {
      number: "+252612480687",
      display: "+252612480687"
    },
    address: {
      street: "Benadir Street",
      city: "Mogadishu",
      country: "Somalia"
    },
    hours: {
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM EST",
      weekends: "Saturday: 10:00 AM - 4:00 PM EST",
      sunday: "Sunday: Closed"
    }
  };

  // FAQ data
  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Hiigsi Forum?",
                     answer: "Hiigsi Forum is a secure system for managing and verifying academic records, job applications, and professional credentials using advanced encryption and verification technology."
        },
        {
          question: "How do I get started?",
          answer: "Simply register for an account based on your role (Student, Institution, Company, or Admin) and follow the verification process to begin using the platform."
        },
        {
          question: "Is my data secure?",
          answer: "Yes, we use advanced encryption and security protocols to ensure your academic records and personal information are secure and tamper-proof."
        }
      ]
    },
    {
      category: "Students",
      questions: [
        {
          question: "How do I upload my academic records?",
          answer: "Navigate to the Academic Records section, click 'Upload Record', and follow the prompts to add your documents. Make sure your institution has verified your account first."
        },
        {
          question: "How do I apply for jobs?",
          answer: "Browse available jobs in the Job Opportunities section, select a position, and submit your application with your cover letter and verified academic records."
        },
        {
          question: "What happens if my application is rejected?",
          answer: "You'll receive a notification explaining the reason. You can improve your application and apply again, or explore other opportunities on the platform."
        }
      ]
    },
    {
      category: "Institutions",
      questions: [
        {
          question: "How do I verify student records?",
          answer: "Once a student uploads their records, you'll receive a verification request. Review the documents and approve or reject them with appropriate feedback."
        },
        {
          question: "Can I manage multiple students?",
          answer: "Yes, you can view and manage all students from your institution through the Students section in your dashboard."
        },
        {
          question: "How do I update student information?",
          answer: "Navigate to the Students section, select a student, and use the edit functionality to update their information and academic records."
        }
      ]
    },
    {
      category: "Companies",
      questions: [
        {
          question: "How do I post a job?",
          answer: "Navigate to Job Postings, click 'Post New Job', fill in the required information including job description, requirements, and documents, then submit."
        },
        {
          question: "How do I manage interviews?",
          answer: "Use the Interviews section to schedule, manage, and track interviews with applicants. You can schedule different types of interviews and track results."
        },
        {
          question: "How do I hire a candidate?",
          answer: "After conducting interviews, you can hire candidates who have passed the interview process. Navigate to the application details and use the 'Hire' button."
        }
      ]
    }
  ];

  // Support resources
  const supportResources = [
    {
      title: "User Guide",
      description: "Comprehensive guide for all platform features",
      icon: BookOpen,
      link: "#",
      badge: "Documentation"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides for common tasks",
      icon: Globe,
      link: "#",
      badge: "Videos"
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      icon: FileText,
      link: "#",
      badge: "Technical"
    },
    {
      title: "Community Forum",
      description: "Connect with other users and share experiences",
      icon: Users,
      link: "#",
      badge: "Community"
    }
  ];

  const handleWhatsAppClick = () => {
         const message = `Hello! I need help with the Hiigsi Forum platform. My user type is: ${user?.userType || 'Unknown'}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `${contactInfo.whatsapp.link}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = (email) => {
         const subject = encodeURIComponent("Hiigsi Forum Platform Support");
     const body = encodeURIComponent(`Hello,\n\nI need assistance with the Hiigsi Forum platform.\n\nUser Type: ${user?.userType || 'Unknown'}\nUser ID: ${user?._id || 'Unknown'}\n\nPlease help me with:\n\n\n\nThank you.`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.open(`tel:${contactInfo.phone.number}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help and contact our support team
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Get in touch with our support team through multiple channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">WhatsApp Support</h3>
                    <p className="text-sm text-muted-foreground">{contactInfo.whatsapp.display}</p>
                    <p className="text-xs text-muted-foreground">Instant messaging support</p>
                  </div>
                </div>
                <Button onClick={handleWhatsAppClick} className="bg-green-600 hover:bg-green-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              </div>

              {/* Email Support */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <MailIcon className="h-4 w-4" />
                  Email Support
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">General Support</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.email.support}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleEmailClick(contactInfo.email.support)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Send Email
                    </Button>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Technical Issues</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.email.technical}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleEmailClick(contactInfo.email.technical)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Send Email
                    </Button>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">General Inquiries</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.email.general}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleEmailClick(contactInfo.email.general)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Send Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* Phone Support */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-muted-foreground">{contactInfo.phone.display}</p>
                    <p className="text-xs text-muted-foreground">Call us during business hours</p>
                  </div>
                </div>
                <Button onClick={handlePhoneClick} variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>

              {/* Business Hours */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Business Hours
                </h3>
                <div className="space-y-1 text-sm">
                  <p>{contactInfo.hours.weekdays}</p>
                  <p>{contactInfo.hours.weekends}</p>
                  <p>{contactInfo.hours.sunday}</p>
                </div>
              </div>

              {/* Office Address */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  Office Address
                </h3>
                <div className="text-sm space-y-1">
                  <p>{contactInfo.address.street}</p>
                  <p>{contactInfo.address.city}</p>
                  <p>{contactInfo.address.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Support Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support Resources
              </CardTitle>
              <CardDescription>
                Helpful resources and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportResources.map((resource, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <resource.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.badge}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => window.open(resource.link, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Access
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Account Info
              </CardTitle>
              <CardDescription>
                Information for support reference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User Type:</span>
                <span className="text-sm font-medium">{user?.userType || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User ID:</span>
                <span className="text-sm font-mono text-xs">{user?._id || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm">{user?.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={user?.isVerifiedByAdmin ? "outline" : "secondary"} className="text-xs">
                  {user?.isVerifiedByAdmin ? "Verified" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{category.category}</h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 