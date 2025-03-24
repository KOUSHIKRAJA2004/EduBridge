import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  BookOpen, 
  DollarSign, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award 
} from "lucide-react";

interface StudentProfile {
  id: number;
  userId: number;
  age?: number;
  educationLevel?: string;
  course?: string;
  institutionName?: string;
  financialNeed?: number;
  skills?: string[];
  bio?: string;
}

interface FundingApplication {
  id: number;
  studentId: number;
  amount: number;
  purpose: string;
  status: string;
  createdAt: string;
}

interface Sponsorship {
  id: number;
  sponsorId: number;
  studentId: number;
  applicationId?: number;
  amount: number;
  status: string;
  mentorshipOffered: boolean;
  createdAt: string;
}

const StudentDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the student dashboard",
        variant: "destructive",
      });
      setLocation("/login");
    } else if (!authLoading && user?.role !== "student") {
      toast({
        title: "Access denied",
        description: "This page is only accessible to students",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, authLoading, setLocation, toast]);
  
  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: [user ? `/api/students/profile/${user.id}` : null],
    enabled: !!user,
  });
  
  const { data: applications, isLoading: applicationsLoading } = useQuery<FundingApplication[]>({
    queryKey: [profile ? `/api/funding-applications/student/${profile.id}` : null],
    enabled: !!profile,
  });
  
  const { data: sponsorships, isLoading: sponsorshipsLoading } = useQuery<Sponsorship[]>({
    queryKey: [profile ? `/api/sponsorships/student/${profile.id}` : null],
    enabled: !!profile,
  });
  
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) return null;
  
  const pendingApplications = applications?.filter(app => app.status === "pending") || [];
  const approvedApplications = applications?.filter(app => app.status === "approved") || [];
  const activeSponsors = sponsorships?.filter(sponsor => sponsor.status === "active") || [];
  
  const totalFundsReceived = activeSponsors.reduce((sum, s) => sum + s.amount, 0);
  const totalFundsNeeded = profile?.financialNeed || 0;
  const fundingProgress = totalFundsNeeded > 0 
    ? Math.min(100, Math.round((totalFundsReceived / totalFundsNeeded) * 100)) 
    : 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.displayName}</p>
          </div>
          
          {!profile ? (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Please complete your profile to access all features
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/student/profile">
                  <Button>Setup Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Funding Goal</p>
                        <p className="text-2xl font-bold">${profile.financialNeed || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-100">
                        <BarChart className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Funds Received</p>
                        <p className="text-2xl font-bold">${totalFundsReceived}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-100">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Applications</p>
                        <p className="text-2xl font-bold">{applications?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-amber-100">
                        <Award className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Sponsors</p>
                        <p className="text-2xl font-bold">{activeSponsors.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Funding Progress */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Funding Progress</CardTitle>
                  <CardDescription>Your journey toward educational funding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">${totalFundsReceived} received</span>
                      <span className="text-sm font-medium">${totalFundsNeeded} goal</span>
                    </div>
                    <Progress value={fundingProgress} className="h-2" />
                    <div className="text-xs text-gray-500 text-right">{fundingProgress}% funded</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Link href="/student/apply" className="w-full sm:w-auto">
                      <Button className="w-full">Apply for Funding</Button>
                    </Link>
                    <Link href="/student/micro-jobs" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full">
                        Find Micro Jobs
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Main Dashboard Tabs */}
              <Tabs defaultValue="applications">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="applications">My Applications</TabsTrigger>
                  <TabsTrigger value="sponsorships">My Sponsors</TabsTrigger>
                  <TabsTrigger value="profile">My Profile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Applications</CardTitle>
                      <CardDescription>Track the status of your funding requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applicationsLoading ? (
                        <div className="flex justify-center p-4">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : applications?.length === 0 ? (
                        <div className="text-center py-6">
                          <FileText className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="mt-2 text-gray-500">No applications found</p>
                          <Link href="/student/apply">
                            <Button className="mt-4">Apply for Funding</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications?.map((application) => (
                            <div key={application.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{application.purpose}</p>
                                  <p className="text-sm text-gray-500">
                                    Amount: ${application.amount}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Applied on: {new Date(application.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge 
                                  variant={
                                    application.status === "approved" ? "success" :
                                    application.status === "rejected" ? "destructive" : "outline"
                                  }
                                >
                                  {application.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Link href="/student/apply">
                        <Button>Create New Application</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sponsorships">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Sponsors</CardTitle>
                      <CardDescription>Sponsors who are supporting your education</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sponsorshipsLoading ? (
                        <div className="flex justify-center p-4">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : sponsorships?.length === 0 ? (
                        <div className="text-center py-6">
                          <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="mt-2 text-gray-500">No sponsors yet</p>
                          <p className="text-sm text-gray-400">Apply for funding to attract sponsors</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sponsorships?.map((sponsorship) => (
                            <div key={sponsorship.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">Sponsor #{sponsorship.sponsorId}</p>
                                  <p className="text-sm text-gray-500">
                                    Amount: ${sponsorship.amount}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Since: {new Date(sponsorship.createdAt).toLocaleDateString()}
                                  </p>
                                  {sponsorship.mentorshipOffered && (
                                    <Badge variant="outline" className="mt-2">
                                      Mentorship Offered
                                    </Badge>
                                  )}
                                </div>
                                <Badge 
                                  variant={sponsorship.status === "active" ? "success" : "outline"}
                                >
                                  {sponsorship.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Profile</CardTitle>
                      <CardDescription>Your educational background and financial needs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                          <p className="text-base">{user.displayName}</p>
                          <p className="text-sm text-gray-600">{profile.age} years old</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Education</h3>
                          <p className="text-base font-medium">{profile.course}</p>
                          <p className="text-sm text-gray-600">{profile.institutionName}</p>
                          <p className="text-sm text-gray-600">Level: {profile.educationLevel}</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Financial Need</h3>
                          <p className="text-base font-medium">${profile.financialNeed}</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.skills?.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                          <p className="text-sm text-gray-600">{profile.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/student/profile">
                        <Button variant="outline">Edit Profile</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
