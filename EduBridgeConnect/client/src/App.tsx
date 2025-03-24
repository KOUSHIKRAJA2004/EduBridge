import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/StudentDashboard";
import SponsorDashboard from "@/pages/SponsorDashboard";
import StudentApply from "@/pages/StudentApply";
import StudentProfile from "@/pages/StudentProfile";
import SponsorProfile from "@/pages/SponsorProfile";
import MicroJobs from "@/pages/MicroJobs";
import SponsorPayment from "@/pages/SponsorPayment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/apply" component={StudentApply} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/micro-jobs" component={MicroJobs} />
      <Route path="/sponsor/dashboard" component={SponsorDashboard} />
      <Route path="/sponsor/profile" component={SponsorProfile} />
      <Route path="/sponsor/payment/:studentId" component={SponsorPayment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
