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
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Building2,
  Users,
  User,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for sponsor profile form
const sponsorProfileSchema = z.object({
  type: z.string().min(1, "Sponsor type is required"),
  organization: z.string().optional(),
  website: z.string().url("Please enter a valid URL").or(z.literal("")),
  focusAreas: z.string().transform(val => val.split(',').map(area => area.trim())),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must not exceed 500 characters"),
});

type SponsorProfileFormValues = z.infer<typeof sponsorProfileSchema>;

const SponsorProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing profile
  const { data: existingProfile } = useQuery({
    queryKey: [user?.id ? `/api/sponsors/profile/${user.id}` : null],
    queryFn: () => apiRequest("GET", `/api/sponsors/profile/${user.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const form = useForm<SponsorProfileFormValues>({
    resolver: zodResolver(sponsorProfileSchema),
    defaultValues: existingProfile || {
      type: '',
      organization: '',
      website: '',
      focusAreas: '',
      bio: '',
    },
  });

  // Redirect if not logged in or not a sponsor
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your profile",
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

  // Output debug information about the user
  useEffect(() => {
    if (user) {
      console.log("Current user:", user);
    }
  }, [user]);

  // Fetch existing profile if any - use userId parameter properly
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: [user ? `/api/sponsors/profile/${user.id}` : null],
    queryFn: user ? () => apiRequest("GET", `/api/sponsors/profile/${user.id}`).then(res => res.json()) : undefined,
    enabled: !!user,
  });

  // Update form with existing profile data when available
  useEffect(() => {
    if (existingProfile) {
      console.log("Existing profile:", existingProfile);
      const focusAreasString = Array.isArray(existingProfile.focusAreas) 
        ? existingProfile.focusAreas.join(", ") 
        : "";
      
      form.reset({
        type: existingProfile.type || "",
        organization: existingProfile.organization || "",
        website: existingProfile.website || "",
        focusAreas: focusAreasString,
        bio: existingProfile.bio || "",
      });
    }
  }, [existingProfile, form]);

  // Mutation for creating/updating profile
  const mutation = useMutation({
    mutationFn: async (values: SponsorProfileFormValues) => {
      const endpoint = existingProfile 
        ? `/api/sponsors/profile/${user?.id}` 
        : "/api/sponsors/profile";
      
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
        description: "Your sponsor profile has been saved successfully",
      });
      
      // Update profile data in cache
      queryClient.invalidateQueries({ queryKey: [`/api/sponsors/profile/${user?.id}`] });
      
      // Redirect to dashboard
      setLocation("/sponsor/dashboard");
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

  const onSubmit = (values: SponsorProfileFormValues) => {
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
              <CardTitle>{existingProfile ? "Update Profile" : "Complete Your Sponsor Profile"}</CardTitle>
              <CardDescription>
                This information helps us match you with students who align with your sponsorship goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sponsor Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sponsor type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>Individual</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="corporate">
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  <span>Corporate</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ngo">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  <span>NGO/Non-profit</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Tech Future Foundation" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank if you're an individual sponsor
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="focusAreas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Focus Areas</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. STEM, Arts, Medicine (comma-separated)" {...field} />
                          </FormControl>
                          <FormDescription>
                            List educational areas you're interested in supporting, separated by commas
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
                          <FormLabel>Bio/Mission Statement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your sponsorship goals and why you want to support students" 
                              className="h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Limit: 500 characters. This helps students understand your sponsorship mission.
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
                      Your profile information will be shared with students you choose to sponsor. We prioritize trust and transparency on our platform.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/sponsor/dashboard")}
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

export default SponsorProfile;
