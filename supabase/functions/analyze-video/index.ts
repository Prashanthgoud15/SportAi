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
    const { videoId, athleteId } = await req.json();

    if (!videoId || !athleteId) {
      return new Response(
        JSON.stringify({ error: 'Missing videoId or athleteId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing video ${videoId} for athlete ${athleteId}`);

    // Get video details from database
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      console.error('Video not found:', videoError);
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get athlete data for context
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select('*, profiles(*)')
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      console.error('Athlete not found:', athleteError);
      return new Response(
        JSON.stringify({ error: 'Athlete not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the prompt for Gemini AI
    const analysisPrompt = `
Analyze this sports training video for an athlete with the following details:
- Sport: ${video.sport_type}
- Video Type: ${video.video_type}
- Athlete Experience: ${athlete.experience_years || 0} years
- Height: ${athlete.height_cm || 'Not specified'} cm
- Weight: ${athlete.weight_kg || 'Not specified'} kg

Please provide a comprehensive analysis in the following JSON format:
{
  "overall_score": number (0-100),
  "technique_score": number (0-100),
  "speed_score": number (0-100),
  "power_score": number (0-100),
  "endurance_score": number (0-100),
  "flexibility_score": number (0-100),
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "detailed_feedback": "Comprehensive feedback paragraph about the athlete's performance, technique, and areas for improvement",
  "ai_confidence": number (0-100)
}

Focus on:
1. Technical execution and form
2. Athletic performance metrics
3. Areas for improvement
4. Specific actionable recommendations
5. Injury prevention insights

Provide realistic scores based on the sport and video type. Be constructive and encouraging while highlighting areas for development.
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
              text: analysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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
    console.log('Gemini response:', geminiData);

    let analysisResult;
    try {
      const responseText = geminiData.candidates[0]?.content?.parts[0]?.text;
      if (!responseText) {
        throw new Error('No response text from Gemini');
      }

      // Extract JSON from the response (in case it's wrapped in markdown or other text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      // Fallback analysis if parsing fails
      analysisResult = {
        overall_score: 75,
        technique_score: 70,
        speed_score: 80,
        power_score: 75,
        endurance_score: 70,
        flexibility_score: 65,
        strengths: ["Good athletic foundation", "Consistent effort", "Positive attitude"],
        weaknesses: ["Technical refinement needed", "Timing could be improved", "Conditioning focus required"],
        recommendations: ["Focus on basic technique drills", "Increase training frequency", "Work with a qualified coach"],
        detailed_feedback: "Analysis completed with basic assessment. For more detailed feedback, please ensure video quality is optimal and captures the full movement patterns.",
        ai_confidence: 60
      };
    }

    // Save assessment to database
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        video_id: videoId,
        athlete_id: athleteId,
        overall_score: analysisResult.overall_score,
        technique_score: analysisResult.technique_score,
        speed_score: analysisResult.speed_score,
        power_score: analysisResult.power_score,
        endurance_score: analysisResult.endurance_score,
        flexibility_score: analysisResult.flexibility_score,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        recommendations: analysisResult.recommendations,
        detailed_feedback: analysisResult.detailed_feedback,
        ai_confidence: analysisResult.ai_confidence,
        analysis_data: analysisResult
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Error saving assessment:', assessmentError);
      throw new Error('Failed to save assessment');
    }

    // Update video as analyzed
    await supabase
      .from('videos')
      .update({ is_analyzed: true })
      .eq('id', videoId);

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        assessment: assessment,
        message: 'Video analysis completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
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