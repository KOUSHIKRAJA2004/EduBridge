// A simple client for the Hugging Face API for AI matching
// In a production app, this would use the actual Hugging Face API

export interface MatchingResult {
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

// Get AI-ranked student matches for a sponsor
export async function getStudentMatches(sponsorId: number): Promise<MatchingResult[]> {
  try {
    const response = await fetch(`/api/ai/sponsor-recommendations/${sponsorId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching AI matches: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get AI student matches:', error);
    throw error;
  }
}

// Get AI-recommended funding sources for a student
export async function getStudentRecommendations(): Promise<MatchingResult[]> {
  try {
    const response = await fetch('/api/ai/match-students');
    
    if (!response.ok) {
      throw new Error(`Error fetching AI recommendations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get AI funding recommendations:', error);
    throw error;
  }
}
