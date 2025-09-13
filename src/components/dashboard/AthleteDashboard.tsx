import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  BarChart3, 
  Target, 
  Trophy, 
  Clock, 
  TrendingUp,
  Video,
  Star,
  MessageSquare,
  Calendar,
  Zap,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  role: 'athlete' | 'coach' | 'admin';
  full_name: string;
  email: string;
}

interface AthleteData {
  id: string;
  primary_sport: string;
  height_cm?: number;
  weight_kg?: number;
  experience_years: number;
  coach_id?: string;
}

interface AthleteDashboardProps {
  profile: UserProfile;
}

const AthleteDashboard = ({ profile }: AthleteDashboardProps) => {
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVideos: 0,
    assessments: 0,
    activePlans: 0,
    completedGoals: 0
  });

  useEffect(() => {
    fetchAthleteData();
    fetchStats();
  }, []);

  const fetchAthleteData = async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching athlete data:', error);
        toast({
          title: "Error",
          description: "Failed to load athlete profile. Please complete your profile setup.",
          variant: "destructive",
        });
      } else if (data) {
        setAthleteData(data);
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
      totalVideos: 0,
      assessments: 0,
      activePlans: 0,
      completedGoals: 0
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
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile.full_name}! 🏆
          </h1>
          <p className="text-muted-foreground">
            Track your progress, upload videos, and achieve your athletic goals.
          </p>
        </div>

        {/* Profile Setup Warning */}
        {!athleteData && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 p-2 rounded-full">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-200">
                    Add your sport preferences and physical stats to get personalized recommendations.
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
          <Card className="hover:shadow-primary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-primary p-3 rounded-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalVideos}</p>
                  <p className="text-sm text-muted-foreground">Videos Uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-secondary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-secondary p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.assessments}</p>
                  <p className="text-sm text-muted-foreground">AI Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-performance p-3 rounded-lg">
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
                <div className="bg-accent p-3 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedGoals}</p>
                  <p className="text-sm text-muted-foreground">Goals Achieved</p>
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
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Get started with your training analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="h-auto p-4 bg-gradient-primary hover:shadow-primary transition-all duration-300"
                    onClick={() => window.location.href = '/upload-video'}
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Upload Video</div>
                      <div className="text-xs opacity-90">Get AI analysis</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 group hover:bg-secondary/10"
                    onClick={() => window.location.href = '/set-goals'}
                  >
                    <div className="text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 group-hover:text-secondary transition-colors" />
                      <div className="font-medium">Set Goals</div>
                      <div className="text-xs text-muted-foreground">Track progress</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest training sessions and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload your first training video to get started!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Track your improvement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Score</span>
                      <span>0/100</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-muted-foreground">--</p>
                      <p className="text-xs text-muted-foreground">Technique</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-muted-foreground">--</p>
                      <p className="text-xs text-muted-foreground">Speed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-primary p-2 rounded-full">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Athlete</p>
                      <p className="text-sm text-muted-foreground">
                        {athleteData?.primary_sport || 'Sport not set'}
                      </p>
                    </div>
                  </div>
                  
                  {athleteData?.experience_years !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span>Experience:</span>
                      <span>{athleteData.experience_years} years</span>
                    </div>
                  )}
                  
                  {athleteData?.coach_id ? (
                    <Badge variant="secondary" className="w-fit">
                      <Users className="w-3 h-3 mr-1" />
                      Has Coach
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-fit">
                      No Coach Assigned
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No active plans</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Request Plan
                  </Button>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;