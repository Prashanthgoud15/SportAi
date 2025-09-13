import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  Trophy, 
  TrendingUp,
  UserPlus,
  MessageSquare,
  FileText,
  Award,
  Target,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  role: 'athlete' | 'coach' | 'admin';
  full_name: string;
  email: string;
}

interface CoachData {
  id: string;
  specialization: string[];
  experience_years: number;
  max_athletes: number;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
}

interface CoachDashboardProps {
  profile: UserProfile;
}

const CoachDashboard = ({ profile }: CoachDashboardProps) => {
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    activePlans: 0,
    pendingAssessments: 0,
    completedAnalyses: 0
  });

  useEffect(() => {
    fetchCoachData();
    fetchStats();
  }, []);

  const fetchCoachData = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching coach data:', error);
        toast({
          title: "Error",
          description: "Failed to load coach profile. Please complete your profile setup.",
          variant: "destructive",
        });
      } else if (data) {
        setCoachData(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // This will be populated as we add more features
    // For now, showing placeholder data
    setStats({
      totalAthletes: 0,
      activePlans: 0,
      pendingAssessments: 0,
      completedAnalyses: 0
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Coach Dashboard 🥇
              </h1>
              <p className="text-muted-foreground">
                Manage your athletes, create training plans, and track performance.
              </p>
            </div>
            {coachData?.is_verified && (
              <Badge className="bg-accent">
                <Award className="w-3 h-3 mr-1" />
                Verified Coach
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Setup Warning */}
        {!coachData && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Complete Your Coach Profile
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Add your specializations and certifications to start coaching athletes.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/profile'}>
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-secondary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-secondary p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAthletes}</p>
                  <p className="text-sm text-muted-foreground">Athletes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-primary p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activePlans}</p>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-performance p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingAssessments}</p>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-accent p-3 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedAnalyses}</p>
                  <p className="text-sm text-muted-foreground">Completed Analyses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Coach Actions</span>
                </CardTitle>
                <CardDescription>
                  Manage your athletes and create training programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-auto p-4 bg-gradient-secondary hover:shadow-secondary transition-all duration-300">
                    <div className="text-center">
                      <UserPlus className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Add Athlete</div>
                      <div className="text-xs opacity-90">Invite new athlete</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 group hover:bg-primary/10">
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2 group-hover:text-primary transition-colors" />
                      <div className="font-medium">Create Plan</div>
                      <div className="text-xs text-muted-foreground">AI-powered plans</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 group hover:bg-accent/10">
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 group-hover:text-accent transition-colors" />
                      <div className="font-medium">Analytics</div>
                      <div className="text-xs text-muted-foreground">Performance data</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Athletes Overview */}
            <Card>
              <CardHeader>
                <CardTitle>My Athletes</CardTitle>
                <CardDescription>Manage and monitor athlete progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No athletes assigned yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start by inviting athletes to join your coaching program
                  </p>
                  <Button className="mt-4 bg-gradient-secondary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Athletes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your athletes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Activity will appear here when athletes upload videos or complete training
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coach Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coach Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-secondary p-2 rounded-full">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Certified Coach</p>
                      <p className="text-sm text-muted-foreground">
                        {coachData?.specialization?.join(', ') || 'Specialization not set'}
                      </p>
                    </div>
                  </div>
                  
                  {coachData?.experience_years !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span>Experience:</span>
                      <span>{coachData.experience_years} years</span>
                    </div>
                  )}
                  
                  {coachData?.rating && coachData.rating > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Rating:</span>
                      <div className="flex items-center">
                        <span>{coachData.rating.toFixed(1)}</span>
                        <Trophy className="w-3 h-3 ml-1 text-yellow-500" />
                        <span className="text-muted-foreground ml-1">
                          ({coachData.total_reviews})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{stats.totalAthletes}/{coachData?.max_athletes || 20}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-muted-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Avg. Improvement</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-3 bg-muted/30 rounded">
                      <p className="font-bold text-muted-foreground">--</p>
                      <p className="text-xs text-muted-foreground">Plans Created</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded">
                      <p className="font-bold text-muted-foreground">--</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No new messages</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Training Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="bg-gradient-primary p-3 rounded-full w-fit mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm mb-3">Generate personalized training plans using AI</p>
                  <Button size="sm" className="bg-gradient-primary">
                    Try AI Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;