import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Target, Plus, Calendar, Trophy, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
}

const SetGoals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_value: 0,
    current_value: 0,
    unit: '',
    target_date: ''
  });

  const goalCategories = [
    'technique',
    'fitness',
    'strength', 
    'speed',
    'endurance',
    'flexibility',
    'skill',
    'competition'
  ];

  const commonUnits = ['kg', 'seconds', 'minutes', 'meters', 'repetitions', 'percentage', 'points'];

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      // First get athlete ID
      const { data: athlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!athlete) {
        toast({
          title: "Profile Required",
          description: "Please complete your athlete profile first.",
          variant: "destructive",
        });
        navigate('/profile');
        return;
      }

      // Fetch goals
      const { data: goalsData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('athlete_id', athlete.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(goalsData || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      target_value: 0,
      current_value: 0,
      unit: '',
      target_date: ''
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || '',
      target_value: goal.target_value || 0,
      current_value: goal.current_value || 0,
      unit: goal.unit || '',
      target_date: goal.target_date ? goal.target_date.split('T')[0] : ''
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and category.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Get athlete ID
      const { data: athlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!athlete) throw new Error('Athlete profile not found');

      const goalData = {
        athlete_id: athlete.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        target_value: formData.target_value || null,
        current_value: formData.current_value || 0,
        unit: formData.unit || null,
        target_date: formData.target_date || null
      };

      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id);

        if (error) throw error;

        toast({
          title: "Goal Updated! 🎯",
          description: "Your goal has been updated successfully.",
        });
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert(goalData);

        if (error) throw error;

        toast({
          title: "Goal Created! 🎯",
          description: "New goal added to track your progress.",
        });
      }

      resetForm();
      fetchGoals();

    } catch (error: any) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save goal.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Goal Deleted",
        description: "Goal removed successfully.",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const isCompleted = goal.target_value ? newValue >= goal.target_value : false;
      
      const { error } = await supabase
        .from('goals')
        .update({
          current_value: newValue,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', goalId);

      if (error) throw error;

      if (isCompleted) {
        toast({
          title: "Goal Achieved! 🏆",
          description: `Congratulations on completing "${goal.title}"!`,
        });
      }

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    if (!goal.target_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Goals & Targets</h1>
              <p className="text-muted-foreground">Set and track your athletic goals</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Goal Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</span>
              </CardTitle>
              <CardDescription>
                Define your target and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Goal Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Improve 100m sprint time"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="0.01"
                      value={formData.target_value}
                      onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      value={formData.current_value}
                      onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your goal and how you plan to achieve it..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-gradient-primary">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        {editingGoal ? 'Update Goal' : 'Create Goal'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.length === 0 ? (
            <div className="md:col-span-2 text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start setting goals to track your athletic progress
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className={`relative ${goal.is_completed ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {goal.is_completed && <Trophy className="w-4 h-4 text-yellow-500" />}
                        <span>{goal.title}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {goal.category}
                        </Badge>
                        {goal.is_completed && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {goal.description && (
                    <CardDescription className="text-sm">
                      {goal.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.target_value && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {goal.current_value}{goal.unit && ` ${goal.unit}`} / {goal.target_value}{goal.unit && ` ${goal.unit}`}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(goal)} className="h-2" />
                      <div className="text-right text-xs text-muted-foreground">
                        {getProgressPercentage(goal).toFixed(1)}% complete
                      </div>
                    </div>
                  )}

                  {goal.target_date && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {!goal.is_completed && goal.target_value && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Update progress"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const newValue = parseFloat(input.value);
                            if (!isNaN(newValue)) {
                              updateProgress(goal.id, newValue);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          const newValue = parseFloat(input.value);
                          if (!isNaN(newValue)) {
                            updateProgress(goal.id, newValue);
                            input.value = '';
                          }
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SetGoals;