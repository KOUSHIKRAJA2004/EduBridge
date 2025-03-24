import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentForm } from "@/components/payment/PaymentForm"; // Assuming this import is correct now

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SponsorPayment = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearch();

  const amount = Number(searchParams.get("amount") || 0);
  const studentId = Number(searchParams.get("studentId") || 0);
  const applicationId = Number(searchParams.get("applicationId") || 0);
  const offerMentorship = searchParams.get("mentorship") === "true";

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to sponsor a student",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!authLoading && user?.role !== "sponsor") {
      toast({
        title: "Access denied", 
        description: "This page is only accessible to sponsors",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
  }, [user, authLoading, setLocation, toast]);

  // Show loading state
  if (authLoading || !user) {
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

  // Check required parameters
  if (!amount || !studentId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Payment Details</CardTitle>
              <CardDescription>Missing required payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/sponsor/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto p-4 flex-grow">
        <Card>
          <CardHeader>
            <CardTitle>Sponsor Payment</CardTitle>
            <CardDescription>Welcome {user?.displayName || 'User'}</CardDescription> {/* Modification here */}
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <PaymentForm 
                amount={amount}
                studentId={studentId}
                sponsorId={user.id}
                applicationId={applicationId || undefined}
                offerMentorship={offerMentorship}
              />
            </Elements>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorPayment;