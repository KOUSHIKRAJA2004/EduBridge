import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, DollarSign, Search, Building, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface MicroJob {
  id: number;
  title: string;
  description: string;
  postedBy: number;
  skillsRequired: string[];
  compensation: number;
  status: string;
  createdAt: string;
}

const MicroJobs = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access micro-jobs",
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
  
  const { data: jobs, isLoading: jobsLoading } = useQuery<MicroJob[]>({
    queryKey: ["/api/micro-jobs"],
    enabled: !!user,
  });
  
  // Filter jobs based on search query
  const filteredJobs = jobs?.filter(job => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.skillsRequired.some(skill => skill.toLowerCase().includes(query))
    );
  });
  
  const openJobs = filteredJobs?.filter(job => job.status === "open") || [];
  const myJobs = filteredJobs?.filter(job => job.status === "assigned") || [];
  const completedJobs = filteredJobs?.filter(job => job.status === "completed") || [];
  
  if (authLoading || jobsLoading) {
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Earn Tuition Credits</h1>
            <p className="text-gray-600">Find micro-jobs that match your skills and earn money for tuition</p>
          </div>
          
          <div className="mb-6 flex items-center relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Search by title, description, or skills" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs defaultValue="available">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="available">Available Jobs</TabsTrigger>
              <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {openJobs.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-gray-700 text-lg font-medium">No jobs available</h3>
                    <p className="text-gray-500">Check back soon for new opportunities</p>
                  </div>
                ) : (
                  openJobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>
                              Posted on {format(new Date(job.createdAt), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          <Badge>
                            <DollarSign className="h-3 w-3 mr-1" />
                            {job.compensation}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">SKILLS REQUIRED</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="h-4 w-4 mr-1" />
                          <span>Posted by #{job.postedBy}</span>
                        </div>
                        <Button>Apply for Job</Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="my-jobs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myJobs.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-gray-700 text-lg font-medium">No active jobs</h3>
                    <p className="text-gray-500">You don't have any jobs in progress</p>
                  </div>
                ) : (
                  myJobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>
                              Assigned on {format(new Date(job.createdAt), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          <Badge>
                            <DollarSign className="h-3 w-3 mr-1" />
                            {job.compensation}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button>Mark as Complete</Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedJobs.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-gray-700 text-lg font-medium">No completed jobs</h3>
                    <p className="text-gray-500">Your completed jobs will appear here</p>
                  </div>
                ) : (
                  completedJobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>
                              Completed on {format(new Date(job.createdAt), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          <Badge variant="success">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {job.compensation}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MicroJobs;
