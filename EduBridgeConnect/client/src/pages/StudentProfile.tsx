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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for student profile form
const studentProfileSchema = z.object({
  age: z.number().min(16, "Age must be at least 16").max(100, "Age must be less than 100").optional(),
  educationLevel: z.string().min(1, "Education level is required"),
  course: z.string().min(1, "Course name is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  financialNeed: z.number().min(100, "Financial need must be at least $100"),
  skills: z.string().transform(val => val.split(',').map(skill => skill.trim())),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must not exceed 500 characters"),
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

const StudentProfile = () => {
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
        description: "Please log in to access your profile",
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
  
  // Fetch existing profile if any
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: [user ? `/api/students/profile/${user.id}` : null],
    enabled: !!user,
  });
  
  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      age: undefined,
      educationLevel: "",
      course: "",
      institutionName: "",
      financialNeed: undefined,
      skills: "",
      bio: "",
    },
  });
  
  // Update form with existing profile data when available
  useEffect(() => {
    if (existingProfile) {
      form.reset({
        age: existingProfile.age,
        educationLevel: existingProfile.educationLevel || "",
        course: existingProfile.course || "",
        institutionName: existingProfile.institutionName || "",
        financialNeed: existingProfile.financialNeed,
        skills: (existingProfile.skills || []).join(", "),
        bio: existingProfile.bio || "",
      });
    }
  }, [existingProfile, form]);
  
  // Mutation for creating/updating profile
  const mutation = useMutation({
    mutationFn: async (values: StudentProfileFormValues) => {
      const endpoint = existingProfile 
        ? `/api/students/profile/${user?.id}` 
        : "/api/students/profile";
      
      const method = existingProfile ? "PUT" : "POST";
      
      // Add userId if creating new profile
      const data = existingProfile 
        ? values 
        : { ...values, userId: user?.id };
      
      return apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: existingProfile ? "Profile updated" : "Profile created",
        description: "Your student profile has been saved successfully",
      });
      
      // Update profile data in cache
      queryClient.invalidateQueries({ queryKey: [`/api/students/profile/${user?.id}`] });
      
      // Redirect to dashboard
      setLocation("/student/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error saving profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = (values: StudentProfileFormValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>{existingProfile ? "Update Profile" : "Complete Your Student Profile"}</CardTitle>
              <CardDescription>
                This information helps sponsors understand your educational goals and financial needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter your age" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high_school">High School</SelectItem>
                              <SelectItem value="associate">Associate Degree</SelectItem>
                              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                              <SelectItem value="master">Master's Degree</SelectItem>
                              <SelectItem value="doctorate">Doctorate</SelectItem>
                              <SelectItem value="vocational">Vocational Training</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="course"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course/Major</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="institutionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Stanford University" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="financialNeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financial Need (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter amount needed" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Total amount needed for tuition, books, and other educational expenses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Programming, Writing, Design (comma-separated)" {...field} />
                          </FormControl>
                          <FormDescription>
                            List your skills separated by commas. These help match you with appropriate sponsors and micro-jobs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself, your background, and your educational goals" 
                              className="h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Limit: 500 characters. This helps sponsors understand your story.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      All information you provide will be visible to potential sponsors to help them make funding decisions.
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
                      {isSubmitting ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
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

export default StudentProfile;
