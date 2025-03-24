import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertStudentProfileSchema, 
  insertSponsorProfileSchema,
  insertFundingApplicationSchema,
  insertSponsorshipSchema,
  insertMicroJobSchema
} from "@shared/schema";
import Stripe from "stripe";
import fetch from "node-fetch";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : undefined;

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug routes for development only
  app.get("/api/debug/users", async (req, res) => {
    try {
      // Get all users for debugging
      const users = Array.from(await storage.getAllUsers());
      // Return users without passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.status(200).json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/debug/create-test-user", async (req, res) => {
    try {
      // Check if test user already exists
      const existingUser = await storage.getUserByUsername("testuser");
      if (existingUser) {
        return res.status(200).json({ 
          message: "Test user already exists", 
          user: { ...existingUser, password: undefined } 
        });
      }
      
      // Create test user
      const userData = {
        username: "testuser",
        password: "password123",
        email: "test@example.com",
        displayName: "Test User",
        role: "sponsor"
      };
      
      const user = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ 
        message: "Test user created successfully", 
        user: userWithoutPassword 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log('Login attempt for:', username);
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // First try exact username match
      let user = await storage.getUserByUsername(username);
      
      // If no user found, try email
      if (!user && username.includes('@')) {
        console.log('Trying email login for:', username);
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        console.log('User not found:', username);
        // List all users for debugging
        const allUsers = await storage.getAllUsers();
        console.log('Available users:', allUsers.map(u => ({username: u.username, email: u.email})));
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('Found user:', user.username, 'Comparing passwords...');

      // Simple password comparison for demo
      if (password !== user.password) {
        console.log('Password mismatch for user:', username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log('Login successful for user:', username);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Student Profile routes
  app.post("/api/students/profile", async (req, res) => {
    try {
      const profileData = insertStudentProfileSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(profileData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a student
      if (user.role !== "student") {
        return res.status(403).json({ message: "Only students can create student profiles" });
      }
      
      // Create student profile
      const profile = await storage.createStudentProfile(profileData);
      
      // Update user profile completion status
      await storage.updateUser(user.id, { profileCompleted: true });
      
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/students/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getStudentProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/students/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const updatedProfile = await storage.updateStudentProfile(userId, req.body);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      res.status(200).json(updatedProfile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Sponsor Profile routes
  app.post("/api/sponsors/profile", async (req, res) => {
    try {
      const profileData = insertSponsorProfileSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(profileData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a sponsor
      if (user.role !== "sponsor") {
        return res.status(403).json({ message: "Only sponsors can create sponsor profiles" });
      }
      
      // Create sponsor profile
      const profile = await storage.createSponsorProfile(profileData);
      
      // Update user profile completion status
      await storage.updateUser(user.id, { profileCompleted: true });
      
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sponsors/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getSponsorProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Sponsor profile not found" });
      }
      
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/sponsors/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const updatedProfile = await storage.updateSponsorProfile(userId, req.body);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Sponsor profile not found" });
      }
      
      res.status(200).json(updatedProfile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Funding Application routes
  app.post("/api/funding-applications", async (req, res) => {
    try {
      const applicationData = insertFundingApplicationSchema.parse(req.body);
      
      // Create funding application
      const application = await storage.createFundingApplication(applicationData);
      
      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/funding-applications/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      if (isNaN(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const applications = await storage.getStudentApplications(studentId);
      
      res.status(200).json(applications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/funding-applications/pending", async (req, res) => {
    try {
      const applications = await storage.getAllPendingApplications();
      
      res.status(200).json(applications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/funding-applications/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedApplication = await storage.updateFundingApplicationStatus(id, status);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Funding application not found" });
      }
      
      res.status(200).json(updatedApplication);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Sponsorship routes
  app.post("/api/sponsorships", async (req, res) => {
    try {
      const sponsorshipData = insertSponsorshipSchema.parse(req.body);
      
      // Create sponsorship
      const sponsorship = await storage.createSponsorship(sponsorshipData);
      
      // If application ID is provided, update application status to approved
      if (sponsorship.applicationId) {
        await storage.updateFundingApplicationStatus(sponsorship.applicationId, "approved");
      }
      
      res.status(201).json(sponsorship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sponsorships/sponsor/:sponsorId", async (req, res) => {
    try {
      const sponsorId = parseInt(req.params.sponsorId);
      
      if (isNaN(sponsorId)) {
        return res.status(400).json({ message: "Invalid sponsor ID" });
      }
      
      const sponsorships = await storage.getSponsorships(sponsorId);
      
      res.status(200).json(sponsorships);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sponsorships/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      if (isNaN(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      
      const sponsorships = await storage.getStudentSponsorships(studentId);
      
      res.status(200).json(sponsorships);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Micro-job routes
  app.post("/api/micro-jobs", async (req, res) => {
    try {
      const jobData = insertMicroJobSchema.parse(req.body);
      
      // Create micro-job
      const job = await storage.createMicroJob(jobData);
      
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/micro-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllMicroJobs();
      
      res.status(200).json(jobs);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/micro-jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      if (!status || !["open", "assigned", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedJob = await storage.updateMicroJobStatus(id, status);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Micro-job not found" });
      }
      
      res.status(200).json(updatedJob);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Matching routes
  app.get("/api/ai/match-students", async (req, res) => {
    try {
      const students = await storage.getAllStudentsForMatching();
      
      // Simplified AI matching - in a real scenario this would use the Hugging Face API
      // Here we just sort by financial need for demonstration
      const rankedStudents = students.sort((a, b) => {
        if (!a.financialNeed) return 1;
        if (!b.financialNeed) return -1;
        return b.financialNeed - a.financialNeed;
      });
      
      // Map to return format without sensitive info
      const results = rankedStudents.map(student => {
        const { user, ...profileData } = student;
        return {
          id: user.id,
          displayName: user.displayName,
          profile: profileData,
          matchScore: profileData.financialNeed ? profileData.financialNeed / 1000 : 0.5  // Normalized score
        };
      });
      
      res.status(200).json(results);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/ai/sponsor-recommendations/:sponsorId", async (req, res) => {
    try {
      const userId = parseInt(req.params.sponsorId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // First get the user to verify
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get sponsor profile to understand their preferences
      const sponsorProfile = await storage.getSponsorProfile(userId);
      if (!sponsorProfile) {
        console.log(`Sponsor profile not found for user ${userId}`);
        // Return empty array instead of 404 to avoid breaking the UI
        return res.json([]);
      }
      
      // Get matching students for this sponsor - use sponsorProfile.id which is the correct ID for the profile
      const students = await storage.getMatchingStudentsForSponsor(userId);
      
      // Simplified AI matching - in a real scenario this would use the Hugging Face API
      // Here we just sort by financial need and if they have a pending application
      const rankedStudents = students.sort((a, b) => {
        // Prioritize students with pending applications
        if (a.application && !b.application) return -1;
        if (!a.application && b.application) return 1;
        
        // Then sort by financial need
        if (!a.financialNeed) return 1;
        if (!b.financialNeed) return -1;
        return b.financialNeed - a.financialNeed;
      });
      
      // Map to return format without sensitive info
      const results = rankedStudents.map(student => {
        const { user, application, ...profileData } = student;
        return {
          id: user.id,
          displayName: user.displayName,
          profile: profileData,
          application: application,
          matchScore: profileData.financialNeed ? profileData.financialNeed / 1000 : 0.5, // Normalized score
          hasPendingApplication: !!application
        };
      });
      
      res.status(200).json(results);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe payment integration
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }
      
      const { amount, sponsorshipId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          sponsorshipId: sponsorshipId ? sponsorshipId.toString() : undefined
        }
      });
      
      // If sponsorshipId is provided, update the sponsorship with the payment ID
      if (sponsorshipId) {
        await storage.updateSponsorshipPaymentId(sponsorshipId, paymentIntent.id);
      }
      
      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
