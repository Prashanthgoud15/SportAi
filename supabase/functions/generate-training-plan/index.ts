import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { athleteId, coachId, goals, focusAreas, duration = 8 } = await req.json();

    if (!athleteId) {
      return new Response(
        JSON.stringify({ error: 'Missing athleteId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating training plan for athlete ${athleteId}`);

    // Get athlete data and recent assessments
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select(`
        *,
        profiles(*),
        assessments:assessments(*)
      `)
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      console.error('Athlete not found:', athleteError);
      return new Response(
        JSON.stringify({ error: 'Athlete not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get latest assessment for context
    const latestAssessment = athlete.assessments?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    // Prepare the prompt for Gemini AI
    const planPrompt = `
Create a comprehensive ${duration}-week training plan for an athlete with the following profile:

ATHLETE PROFILE:
- Name: ${athlete.profiles?.full_name}
- Sport: ${athlete.primary_sport}
- Experience: ${athlete.experience_years || 0} years
- Height: ${athlete.height_cm || 'Not specified'} cm
- Weight: ${athlete.weight_kg || 'Not specified'} kg
${athlete.preferred_position ? `- Position: ${athlete.preferred_position}` : ''}

${latestAssessment ? `
LATEST ASSESSMENT SCORES:
- Overall: ${latestAssessment.overall_score}/100
- Technique: ${latestAssessment.technique_score}/100
- Speed: ${latestAssessment.speed_score}/100
- Power: ${latestAssessment.power_score}/100
- Endurance: ${latestAssessment.endurance_score}/100
- Flexibility: ${latestAssessment.flexibility_score}/100

STRENGTHS: ${latestAssessment.strengths?.join(', ')}
WEAKNESSES: ${latestAssessment.weaknesses?.join(', ')}
` : ''}

${goals && goals.length > 0 ? `ATHLETE GOALS: ${goals.join(', ')}` : ''}
${focusAreas && focusAreas.length > 0 ? `FOCUS AREAS: ${focusAreas.join(', ')}` : ''}

Please generate a detailed training plan in the following JSON format:

{
  "title": "Training plan title",
  "description": "Brief description of the plan's objectives",
  "duration_weeks": ${duration},
  "difficulty_level": number (1-5),
  "goals": ["goal1", "goal2", "goal3"],
  "weeks": [
    {
      "week_number": 1,
      "focus": "Week focus theme",
      "days": [
        {
          "day": 1,
          "type": "training_type", // strength, cardio, skill, recovery, etc.
          "exercises": [
            {
              "name": "Exercise name",
              "sets": number,
              "reps": "reps or duration",
              "rest": "rest time",
              "notes": "technique notes or modifications"
            }
          ],
          "duration_minutes": number,
          "intensity": "low/medium/high"
        }
      ]
    }
  ],
  "nutrition_tips": ["tip1", "tip2", "tip3"],
  "recovery_guidelines": ["guideline1", "guideline2", "guideline3"],
  "progression_notes": "How to progress through the weeks",
  "safety_considerations": ["safety1", "safety2", "safety3"]
}

REQUIREMENTS:
1. Create a progressive plan that builds intensity over ${duration} weeks
2. Include sport-specific exercises and drills
3. Address the athlete's weaknesses identified in assessments
4. Include proper warm-up, main exercises, and cool-down for each session
5. Provide 4-6 training days per week with rest/recovery days
6. Include injury prevention exercises
7. Scale difficulty appropriately for the athlete's experience level
8. Include both physical and technical development
9. Provide clear exercise instructions and safety notes
10. Consider equipment limitations (basic equipment availability)

Make it practical for implementation in various training environments, including limited equipment scenarios common in rural India.
`;

    // Call Gemini AI API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: planPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    let planResult;
    try {
      const responseText = geminiData.candidates[0]?.content?.parts[0]?.text;
      if (!responseText) {
        throw new Error('No response text from Gemini');
      }

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      planResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      // Fallback training plan if parsing fails
      planResult = {
        title: `${duration}-Week ${athlete.primary_sport} Development Plan`,
        description: "A comprehensive training program designed to improve overall athletic performance",
        duration_weeks: duration,
        difficulty_level: Math.min(athlete.experience_years + 1, 5),
        goals: goals || ["Improve overall fitness", "Enhance technique", "Build strength and endurance"],
        weeks: Array.from({ length: duration }, (_, i) => ({
          week_number: i + 1,
          focus: i < 2 ? "Foundation Building" : i < 4 ? "Skill Development" : i < 6 ? "Performance Enhancement" : "Competition Preparation",
          days: [
            {
              day: 1,
              type: "strength",
              exercises: [
                { name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "60s", notes: "Focus on proper form" },
                { name: "Push-ups", sets: 3, reps: "8-12", rest: "60s", notes: "Modify as needed" },
                { name: "Plank", sets: 3, reps: "30-45s", rest: "60s", notes: "Maintain straight line" }
              ],
              duration_minutes: 45,
              intensity: "medium"
            }
          ]
        })),
        nutrition_tips: ["Stay hydrated", "Eat balanced meals", "Include protein for recovery"],
        recovery_guidelines: ["Get 7-9 hours of sleep", "Include rest days", "Listen to your body"],
        progression_notes: "Gradually increase intensity and complexity over the weeks",
        safety_considerations: ["Warm up properly", "Use correct form", "Stop if you feel pain"]
      };
    }

    // Save training plan to database
    const { data: trainingPlan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        athlete_id: athleteId,
        coach_id: coachId,
        title: planResult.title,
        description: planResult.description,
        sport_type: athlete.primary_sport,
        duration_weeks: planResult.duration_weeks,
        difficulty_level: planResult.difficulty_level,
        goals: planResult.goals,
        plan_data: planResult,
        is_active: true
      })
      .select()
      .single();

    if (planError) {
      console.error('Error saving training plan:', planError);
      throw new Error('Failed to save training plan');
    }

    console.log('Training plan generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        training_plan: trainingPlan,
        message: 'Training plan generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-training-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: 'Check the function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});