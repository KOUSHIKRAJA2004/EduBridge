import {
  users, type User, type InsertUser,
  studentProfiles, type StudentProfile, type InsertStudentProfile,
  sponsorProfiles, type SponsorProfile, type InsertSponsorProfile,
  fundingApplications, type FundingApplication, type InsertFundingApplication,
  sponsorships, type Sponsorship, type InsertSponsorship,
  microJobs, type MicroJob, type InsertMicroJob
} from "@shared/schema";

export interface IStorage {
  // User methods
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Student profile methods
  getStudentProfile(userId: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(userId: number, data: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined>;
  
  // Sponsor profile methods
  getSponsorProfile(userId: number): Promise<SponsorProfile | undefined>;
  createSponsorProfile(profile: InsertSponsorProfile): Promise<SponsorProfile>;
  updateSponsorProfile(userId: number, data: Partial<InsertSponsorProfile>): Promise<SponsorProfile | undefined>;
  
  // Funding application methods
  getFundingApplication(id: number): Promise<FundingApplication | undefined>;
  getStudentApplications(studentId: number): Promise<FundingApplication[]>;
  createFundingApplication(application: InsertFundingApplication): Promise<FundingApplication>;
  updateFundingApplicationStatus(id: number, status: string): Promise<FundingApplication | undefined>;
  getAllPendingApplications(): Promise<FundingApplication[]>;
  
  // Sponsorship methods
  createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship>;
  getSponsorships(sponsorId: number): Promise<Sponsorship[]>;
  getStudentSponsorships(studentId: number): Promise<Sponsorship[]>;
  updateSponsorshipPaymentId(id: number, paymentId: string): Promise<Sponsorship | undefined>;
  
  // Micro-job methods
  createMicroJob(job: InsertMicroJob): Promise<MicroJob>;
  getAllMicroJobs(): Promise<MicroJob[]>;
  getMicroJob(id: number): Promise<MicroJob | undefined>;
  updateMicroJobStatus(id: number, status: string): Promise<MicroJob | undefined>;
  
  // AI matching helpers
  getAllStudentsForMatching(): Promise<Array<StudentProfile & { user: User }>>;
  getMatchingStudentsForSponsor(sponsorId: number): Promise<Array<StudentProfile & { user: User, application?: FundingApplication }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studentProfiles: Map<number, StudentProfile>;
  private sponsorProfiles: Map<number, SponsorProfile>;
  private fundingApplications: Map<number, FundingApplication>;
  private sponsorships: Map<number, Sponsorship>;
  private microJobs: Map<number, MicroJob>;
  private currentUserId: number;
  private currentStudentProfileId: number;
  private currentSponsorProfileId: number;
  private currentFundingApplicationId: number;
  private currentSponsorshipId: number;
  private currentMicroJobId: number;

  constructor() {
    this.users = new Map();
    this.studentProfiles = new Map();
    this.sponsorProfiles = new Map();
    this.fundingApplications = new Map();
    this.sponsorships = new Map();
    this.microJobs = new Map();
    this.currentUserId = 1;
    this.currentStudentProfileId = 1;
    this.currentSponsorProfileId = 1;
    this.currentFundingApplicationId = 1;
    this.currentSponsorshipId = 1;
    this.currentMicroJobId = 1;
  }

  // User methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, profileCompleted: false };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Student profile methods
  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    return Array.from(this.studentProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const id = this.currentStudentProfileId++;
    const studentProfile: StudentProfile = { ...profile, id };
    this.studentProfiles.set(id, studentProfile);
    return studentProfile;
  }

  async updateStudentProfile(userId: number, data: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined> {
    const profile = await this.getStudentProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...data };
    this.studentProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Sponsor profile methods
  async getSponsorProfile(userId: number): Promise<SponsorProfile | undefined> {
    return Array.from(this.sponsorProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createSponsorProfile(profile: InsertSponsorProfile): Promise<SponsorProfile> {
    const id = this.currentSponsorProfileId++;
    const sponsorProfile: SponsorProfile = { ...profile, id };
    this.sponsorProfiles.set(id, sponsorProfile);
    return sponsorProfile;
  }

  async updateSponsorProfile(userId: number, data: Partial<InsertSponsorProfile>): Promise<SponsorProfile | undefined> {
    const profile = await this.getSponsorProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...data };
    this.sponsorProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Funding application methods
  async getFundingApplication(id: number): Promise<FundingApplication | undefined> {
    return this.fundingApplications.get(id);
  }

  async getStudentApplications(studentId: number): Promise<FundingApplication[]> {
    return Array.from(this.fundingApplications.values()).filter(
      (application) => application.studentId === studentId,
    );
  }

  async createFundingApplication(application: InsertFundingApplication): Promise<FundingApplication> {
    const id = this.currentFundingApplicationId++;
    const fundingApplication: FundingApplication = { 
      ...application, 
      id, 
      status: "pending", 
      createdAt: new Date() 
    };
    this.fundingApplications.set(id, fundingApplication);
    return fundingApplication;
  }

  async updateFundingApplicationStatus(id: number, status: string): Promise<FundingApplication | undefined> {
    const application = await this.getFundingApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    this.fundingApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getAllPendingApplications(): Promise<FundingApplication[]> {
    return Array.from(this.fundingApplications.values()).filter(
      (application) => application.status === "pending",
    );
  }

  // Sponsorship methods
  async createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship> {
    const id = this.currentSponsorshipId++;
    const newSponsorship: Sponsorship = { 
      ...sponsorship, 
      id, 
      status: "active", 
      paymentId: "", 
      createdAt: new Date() 
    };
    this.sponsorships.set(id, newSponsorship);
    return newSponsorship;
  }

  async getSponsorships(sponsorId: number): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values()).filter(
      (sponsorship) => sponsorship.sponsorId === sponsorId,
    );
  }

  async getStudentSponsorships(studentId: number): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values()).filter(
      (sponsorship) => sponsorship.studentId === studentId,
    );
  }

  async updateSponsorshipPaymentId(id: number, paymentId: string): Promise<Sponsorship | undefined> {
    const sponsorship = this.sponsorships.get(id);
    if (!sponsorship) return undefined;
    
    const updatedSponsorship = { ...sponsorship, paymentId };
    this.sponsorships.set(id, updatedSponsorship);
    return updatedSponsorship;
  }

  // Micro-job methods
  async createMicroJob(job: InsertMicroJob): Promise<MicroJob> {
    const id = this.currentMicroJobId++;
    const microJob: MicroJob = { 
      ...job, 
      id, 
      status: "open", 
      createdAt: new Date() 
    };
    this.microJobs.set(id, microJob);
    return microJob;
  }

  async getAllMicroJobs(): Promise<MicroJob[]> {
    return Array.from(this.microJobs.values());
  }

  async getMicroJob(id: number): Promise<MicroJob | undefined> {
    return this.microJobs.get(id);
  }

  async updateMicroJobStatus(id: number, status: string): Promise<MicroJob | undefined> {
    const job = await this.getMicroJob(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, status };
    this.microJobs.set(id, updatedJob);
    return updatedJob;
  }

  // AI matching helpers
  async getAllStudentsForMatching(): Promise<Array<StudentProfile & { user: User }>> {
    const students: Array<StudentProfile & { user: User }> = [];
    
    for (const profile of this.studentProfiles.values()) {
      const user = await this.getUser(profile.userId);
      if (user) {
        students.push({
          ...profile,
          user,
        });
      }
    }
    
    return students;
  }

  async getMatchingStudentsForSponsor(userId: number): Promise<Array<StudentProfile & { user: User, application?: FundingApplication }>> {
    // In this implementation, we're getting the sponsor profile using userId (not profile ID)
    const sponsorProfile = await this.getSponsorProfile(userId);
    
    if (!sponsorProfile) {
      console.warn(`No sponsor profile found for user ${userId}`);
      return [];
    }
    
    const students: Array<StudentProfile & { user: User, application?: FundingApplication }> = [];
    
    for (const profile of this.studentProfiles.values()) {
      const user = await this.getUser(profile.userId);
      if (user) {
        // Get the latest pending application if exists
        const applications = await this.getStudentApplications(profile.userId); // Fix: use userId instead of profile.id
        const pendingApplication = applications.find(app => app.status === 'pending');
        
        students.push({
          ...profile,
          user,
          application: pendingApplication,
        });
      }
    }
    
    return students;
  }
}

export const storage = new MemStorage();
