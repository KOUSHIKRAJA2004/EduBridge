import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for funding application form
const fundingApplicationSchema = z.object({
  amount: z.number().min(100, "Amount must be at least $100"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters").max(500, "Purpose must not exceed 500 characters"),
  // In a real app, this would handle file uploads
  // documents: z.any(),
});

type FundingApplicationValues = z.infer<typeof fundingApplicationSchema>;

const StudentApply = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for funding",
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

  // Fetch student profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: [user ? `/api/students/profile/${user.id}` : null],
    enabled: !!user,
  });

  // Redirect if profile is not complete
  useEffect(() => {
    if (!profileLoading && !profile && user) {
      toast({
        title: "Profile required",
        description: "Please complete your profile before applying for funding",
      });
      setLocation("/student/profile");
    }
  }, [profile, profileLoading, user, setLocation, toast]);

  const form = useForm<FundingApplicationValues>({
    resolver: zodResolver(fundingApplicationSchema),
    defaultValues: {
      amount: undefined,
      purpose: "",
    },
  });

  // Mutation for creating funding application
  const mutation = useMutation({
    mutationFn: async (values: FundingApplicationValues) => {
      // Add studentId to the values
      const data = {
        ...values,
        studentId: profile?.id,
      };
      
      return apiRequest("POST", "/api/funding-applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your funding application has been submitted successfully",
      });
      
      // Update applications data in cache
      queryClient.invalidateQueries({ queryKey: [`/api/funding-applications/student/${profile?.id}`] });
      
      // Redirect to dashboard
      setLocation("/student/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting application",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (values: FundingApplicationValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
  };

  if (authLoading || profileLoading || !profile) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Financial Support</CardTitle>
              <CardDescription>
                Submit your funding request to connect with potential sponsors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-gray-900">Profile Summary</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Name: {user?.displayName}</p>
                        <p>Course: {profile.course}</p>
                        <p>Institution: {profile.institutionName}</p>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount Needed (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter amount needed" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify the exact amount needed for this funding request
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose of Funding</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain what the funds will be used for and why this support is important for your education" 
                              className="h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Be specific about how this funding will impact your education
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supporting Documents (Optional)
                      </label>
                      <div className="mt-1 border-2 border-dashed rounded-md px-6 pt-5 pb-6 border-gray-300">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                            >
                              <span>Upload files</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                multiple
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Tuition bills, school-related invoices, or other relevant documents
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Alert variant="info">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Application Review Process</AlertTitle>
                    <AlertDescription>
                      Your application will be reviewed and matched with potential sponsors. 
                      You'll receive notifications when sponsors express interest in your application.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/student/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentApply;
