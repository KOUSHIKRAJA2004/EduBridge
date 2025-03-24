import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getStudentMatches } from "@/lib/huggingface";
import { apiRequest } from "@/lib/queryClient";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  GraduationCap,
  Heart,
  BookOpen,
  Search,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

interface SponsorProfile {
  id: number;
  userId: number;
  type?: string;
  organization?: string;
  website?: string;
  focusAreas?: string[];
  bio?: string;
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

interface StudentMatch {
  id: number;
  displayName: string;
  profile: {
    id: number;
    financialNeed?: number;
    course?: string;
    institutionName?: string;
    bio?: string;
  };
  matchScore: number;
  hasPendingApplication?: boolean;
  application?: {
    id: number;
    amount: number;
    purpose: string;
    status: string;
  };
}

const SponsorDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [studentMatches, setStudentMatches] = useState<StudentMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the sponsor dashboard",
        variant: "destructive",
      });
      setLocation("/login");
    } else if (!authLoading && user?.role !== "sponsor") {
      toast({
        title: "Access denied",
        description: "This page is only accessible to sponsors",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, authLoading, setLocation, toast]);
  
  const { data: profile, isLoading: profileLoading } = useQuery<SponsorProfile>({
    queryKey: [user ? `/api/sponsors/profile/${user.id}` : null],
    enabled: !!user,
  });
  
  // When querying sponsorships, we need to use the user ID, not the profile ID
  const { data: sponsorships, isLoading: sponsorshipsLoading } = useQuery<Sponsorship[]>({
    queryKey: [user ? `/api/sponsorships/sponsor/${user.id}` : null],
    queryFn: user ? () => apiRequest("GET", `/api/sponsorships/sponsor/${user.id}`).then(res => res.json()) : undefined,
    enabled: !!user,
  });
  
  // Load AI matches when profile is loaded
  useEffect(() => {
    if (profile) {
      loadStudentMatches();
    }
  }, [profile]);
  
  const loadStudentMatches = async () => {
    if (!user) return;
    
    setMatchesLoading(true);
    try {
      // Use user.id instead of profile.id for consistency
      const matches = await getStudentMatches(user.id);
      setStudentMatches(matches);
    } catch (error) {
      console.error("Failed to load AI matches:", error);
      toast({
        title: "Error loading student matches",
        description: "Could not retrieve AI-powered student recommendations",
        variant: "destructive",
      });
    } finally {
      setMatchesLoading(false);
    }
  };
  
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
  
  const activeSponshorships = sponsorships?.filter(s => s.status === "active") || [];
  const totalSponsored = activeSponshorships.reduce((sum, s) => sum + s.amount, 0);
  
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sponsor Dashboard</h1>
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
                <Link href="/sponsor/profile">
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
                      <div className="p-2 rounded-full bg-purple-100">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Students Sponsored</p>
                        <p className="text-2xl font-bold">{activeSponshorships.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-100">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Funded</p>
                        <p className="text-2xl font-bold">${totalSponsored}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Sponsor Type</p>
                        <p className="text-xl font-medium capitalize">{profile.type || "Individual"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-amber-100">
                        <BookOpen className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Focus Areas</p>
                        <p className="text-xl font-medium">
                          {profile.focusAreas && profile.focusAreas.length > 0 
                            ? `${profile.focusAreas.length} areas` 
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Dashboard Tabs */}
              <Tabs defaultValue="students">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="students">Find Students</TabsTrigger>
                  <TabsTrigger value="sponsorships">Active Sponsorships</TabsTrigger>
                  <TabsTrigger value="profile">My Profile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="students">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <div className="flex items-center">
                          <Search className="h-5 w-5 mr-2" />
                          AI-Matched Students
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Students matched to your profile based on their needs and your focus areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {matchesLoading ? (
                        <div className="flex justify-center p-4">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : studentMatches.length === 0 ? (
                        <div className="text-center py-6">
                          <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="mt-2 text-gray-500">No student matches found</p>
                          <p className="text-sm text-gray-400">
                            Check back soon as new students join the platform
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {studentMatches.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                  <Avatar className="h-10 w-10 mr-4">
                                    <AvatarFallback>{getInitials(student.displayName)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium">{student.displayName}</h3>
                                    <p className="text-sm text-gray-500">
                                      {student.profile.course} at {student.profile.institutionName}
                                    </p>
                                    {student.hasPendingApplication && (
                                      <Badge variant="outline" className="mt-1 bg-yellow-50">
                                        Has pending application
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-primary">
                                    ${student.profile.financialNeed}
                                  </div>
                                  <div className="text-xs text-gray-500">needed</div>
                                  <div className="text-xs font-medium mt-1">
                                    {Math.round(student.matchScore * 100)}% match
                                  </div>
                                </div>
                              </div>
                              
                              {student.application && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                                  <p className="text-sm font-medium">Funding Request: ${student.application.amount}</p>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {student.application.purpose}
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-4 text-sm text-gray-600 line-clamp-3">
                                {student.profile.bio}
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <Link href={`/sponsor/payment/${student.profile.id}`}>
                                  <Button>
                                    <Heart className="h-4 w-4 mr-2" />
                                    Sponsor
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <p className="text-sm text-gray-500">
                        Matches are updated daily based on student applications
                      </p>
                      <Button variant="outline" onClick={loadStudentMatches}>
                        Refresh Matches
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sponsorships">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Sponsorships</CardTitle>
                      <CardDescription>
                        Students you are currently supporting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sponsorshipsLoading ? (
                        <div className="flex justify-center p-4">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : activeSponshorships.length === 0 ? (
                        <div className="text-center py-6">
                          <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="mt-2 text-gray-500">No active sponsorships</p>
                          <p className="text-sm text-gray-400">
                            Start sponsoring students to see them here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeSponshorships.map((sponsorship) => (
                            <div key={sponsorship.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                    <p className="font-medium">Student #{sponsorship.studentId}</p>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Sponsorship amount: ${sponsorship.amount}
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
                                <Badge className="bg-green-100 text-green-800">
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
                      <CardTitle>Sponsor Profile</CardTitle>
                      <CardDescription>Your sponsorship preferences and information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Sponsor Information</h3>
                          <p className="text-base">{user.displayName}</p>
                          {profile.organization && (
                            <p className="text-sm text-gray-600">{profile.organization}</p>
                          )}
                          <p className="text-sm text-gray-600 capitalize">Type: {profile.type}</p>
                        </div>
                        
                        {profile.website && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Website</h3>
                            <a 
                              href={profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {profile.website}
                            </a>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Focus Areas</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.focusAreas?.map((area, index) => (
                              <Badge key={index} variant="outline">{area}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Bio/Mission</h3>
                          <p className="text-sm text-gray-600">{profile.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/sponsor/profile">
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

export default SponsorDashboard;
