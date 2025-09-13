import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  state: string;
  district: string;
  village_city: string;
}

interface AthleteData {
  primary_sport: string;
  secondary_sports: string[];
  height_cm: number;
  weight_kg: number;
  experience_years: number;
  preferred_position: string;
  achievements: string[];
  medical_conditions: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface CoachData {
  specialization: string[];
  experience_years: number;
  certifications: string[];
  coaching_philosophy: string;
  languages: string[];
  max_athletes: number;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<'athlete' | 'coach'>('athlete');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    state: '',
    district: '',
    village_city: ''
  });

  const [athleteData, setAthleteData] = useState<AthleteData>({
    primary_sport: '',
    secondary_sports: [],
    height_cm: 0,
    weight_kg: 0,
    experience_years: 0,
    preferred_position: '',
    achievements: [],
    medical_conditions: [],
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const [coachData, setCoachData] = useState<CoachData>({
    specialization: [],
    experience_years: 0,
    certifications: [],
    coaching_philosophy: '',
    languages: ['English'],
    max_athletes: 20
  });

  const sports = ['Football', 'Cricket', 'Basketball', 'Volleyball', 'Athletics', 'Swimming', 'Tennis', 'Badminton', 'Hockey', 'Other'];

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          email: profile.email || user?.email || '',
          phone: profile.phone || '',
          gender: profile.gender || '',
          date_of_birth: profile.date_of_birth || '',
          state: profile.state || '',
          district: profile.district || '',
          village_city: profile.village_city || ''
        });
        setUserRole(profile.role as 'athlete' | 'coach');

        if (profile.role === 'athlete') {
          // Fetch athlete specific data
          const { data: athlete } = await supabase
            .from('athletes')
            .select('*')
            .eq('user_id', user?.id)
            .single();

          if (athlete) {
            setAthleteData({
              primary_sport: athlete.primary_sport || '',
              secondary_sports: athlete.secondary_sports || [],
              height_cm: athlete.height_cm || 0,
              weight_kg: athlete.weight_kg || 0,
              experience_years: athlete.experience_years || 0,
              preferred_position: athlete.preferred_position || '',
              achievements: athlete.achievements || [],
              medical_conditions: athlete.medical_conditions || [],
              emergency_contact_name: athlete.emergency_contact_name || '',
              emergency_contact_phone: athlete.emergency_contact_phone || ''
            });
          }
        } else if (profile.role === 'coach') {
          // Fetch coach specific data
          const { data: coach } = await supabase
            .from('coaches')
            .select('*')
            .eq('user_id', user?.id)
            .single();

          if (coach) {
            setCoachData({
              specialization: coach.specialization || [],
              experience_years: coach.experience_years || 0,
              certifications: coach.certifications || [],
              coaching_philosophy: coach.coaching_philosophy || '',
              languages: coach.languages || ['English'],
              max_athletes: coach.max_athletes || 20
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          gender: profileData.gender as any,
          ...profileData
        });

      if (profileError) throw profileError;

      if (userRole === 'athlete') {
        const { error: athleteError } = await supabase
          .from('athletes')
          .upsert({
            user_id: user?.id,
            profile_id: user?.id,
            primary_sport: athleteData.primary_sport as any,
            ...athleteData
          });

        if (athleteError) throw athleteError;
      } else if (userRole === 'coach') {
        const { error: coachError } = await supabase
          .from('coaches')
          .upsert({
            user_id: user?.id,
            profile_id: user?.id,
            specialization: coachData.specialization as any,
            ...coachData
          });

        if (coachError) throw coachError;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profileData.gender} onValueChange={(value) => setProfileData({...profileData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                    placeholder="Your state"
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={profileData.district}
                    onChange={(e) => setProfileData({...profileData, district: e.target.value})}
                    placeholder="Your district"
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village/City</Label>
                  <Input
                    id="village"
                    value={profileData.village_city}
                    onChange={(e) => setProfileData({...profileData, village_city: e.target.value})}
                    placeholder="Your village or city"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {userRole === 'athlete' ? (
            <Card>
              <CardHeader>
                <CardTitle>Athlete Information</CardTitle>
                <CardDescription>Your sports and physical details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primarySport">Primary Sport</Label>
                    <Select value={athleteData.primary_sport} onValueChange={(value) => setAthleteData({...athleteData, primary_sport: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport} value={sport.toLowerCase()}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={athleteData.experience_years}
                      onChange={(e) => setAthleteData({...athleteData, experience_years: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={athleteData.height_cm}
                      onChange={(e) => setAthleteData({...athleteData, height_cm: parseInt(e.target.value) || 0})}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={athleteData.weight_kg}
                      onChange={(e) => setAthleteData({...athleteData, weight_kg: parseFloat(e.target.value) || 0})}
                      placeholder="65"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Preferred Position</Label>
                    <Input
                      id="position"
                      value={athleteData.preferred_position}
                      onChange={(e) => setAthleteData({...athleteData, preferred_position: e.target.value})}
                      placeholder="e.g., Striker, Point Guard"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyName"
                      value={athleteData.emergency_contact_name}
                      onChange={(e) => setAthleteData({...athleteData, emergency_contact_name: e.target.value})}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={athleteData.emergency_contact_phone}
                      onChange={(e) => setAthleteData({...athleteData, emergency_contact_phone: e.target.value})}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Coach Information</CardTitle>
                <CardDescription>Your coaching credentials and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coachExperience">Coaching Experience (Years)</Label>
                    <Input
                      id="coachExperience"
                      type="number"
                      value={coachData.experience_years}
                      onChange={(e) => setCoachData({...coachData, experience_years: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAthletes">Maximum Athletes</Label>
                    <Input
                      id="maxAthletes"
                      type="number"
                      value={coachData.max_athletes}
                      onChange={(e) => setCoachData({...coachData, max_athletes: parseInt(e.target.value) || 20})}
                      placeholder="20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="philosophy">Coaching Philosophy</Label>
                  <Textarea
                    id="philosophy"
                    value={coachData.coaching_philosophy}
                    onChange={(e) => setCoachData({...coachData, coaching_philosophy: e.target.value})}
                    placeholder="Describe your coaching approach and philosophy..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;