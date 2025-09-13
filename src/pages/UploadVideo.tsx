import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Video, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport_type: '',
    video_type: 'practice'
  });

  const sports = ['football', 'cricket', 'basketball', 'volleyball', 'athletics', 'swimming', 'tennis', 'badminton', 'hockey', 'other'];
  const videoTypes = ['practice', 'match', 'drill', 'technique', 'fitness'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid video file.",
          variant: "destructive",
        });
        return;
      }

      setVideoFile(file);
      setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, "") });
    }
  };

  const uploadToSupabase = async () => {
    if (!videoFile || !user) return null;

    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, videoFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile || !formData.title || !formData.sport_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a video.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // First, get athlete ID
      const { data: athlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!athlete) {
        throw new Error('Athlete profile not found. Please complete your profile first.');
      }

      setUploadProgress(30);

      // Upload video to storage
      const uploadResult = await uploadToSupabase();
      setUploadProgress(60);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(uploadResult!.path);

      setUploadProgress(80);

      // Save video metadata to database
      const { data: video, error: dbError } = await supabase
        .from('videos')
        .insert({
          athlete_id: athlete.id,
          title: formData.title,
          description: formData.description,
          sport_type: formData.sport_type as any,
          video_type: formData.video_type,
          video_url: urlData.publicUrl,
          file_size_mb: videoFile.size / (1024 * 1024),
          duration_seconds: 0, // Will be updated after analysis
          upload_status: 'uploaded'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast({
        title: "Video Uploaded Successfully! 🎉",
        description: "Your video is now ready for AI analysis.",
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Training Video</h1>
            <p className="text-muted-foreground">Upload your performance video for AI analysis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Video Upload</span>
              </CardTitle>
              <CardDescription>
                Upload your training or match video to get detailed AI-powered performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="video">Video File</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  {videoFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="font-medium">{videoFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoFile(null)}
                      >
                        Change Video
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">
                          MP4, MOV, AVI files up to 100MB
                        </p>
                      </div>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('video')?.click()}
                      >
                        Select Video
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Video Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Sprint Training Session"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sport">Sport Type *</Label>
                  <Select 
                    value={formData.sport_type} 
                    onValueChange={(value) => setFormData({ ...formData, sport_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport.charAt(0).toUpperCase() + sport.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="videoType">Video Type</Label>
                  <Select 
                    value={formData.video_type} 
                    onValueChange={(value) => setFormData({ ...formData, video_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select video type" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what happens in this video, what you want to improve, any specific areas of focus..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={uploading || !videoFile}
                className="w-full bg-gradient-primary"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Video...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Analyze Video
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips for better analysis:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Record in good lighting conditions</li>
                  <li>• Keep the camera stable</li>
                  <li>• Capture the full movement/technique</li>
                  <li>• Include multiple angles if possible</li>
                  <li>• Ensure clear view of key body movements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;