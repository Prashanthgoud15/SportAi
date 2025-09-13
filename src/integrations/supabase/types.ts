export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          ai_confidence: number | null
          analysis_data: Json | null
          athlete_id: string
          created_at: string
          detailed_feedback: string | null
          endurance_score: number | null
          flexibility_score: number | null
          id: string
          overall_score: number
          power_score: number | null
          recommendations: string[] | null
          speed_score: number | null
          strengths: string[] | null
          technique_score: number | null
          video_id: string
          weaknesses: string[] | null
        }
        Insert: {
          ai_confidence?: number | null
          analysis_data?: Json | null
          athlete_id: string
          created_at?: string
          detailed_feedback?: string | null
          endurance_score?: number | null
          flexibility_score?: number | null
          id?: string
          overall_score: number
          power_score?: number | null
          recommendations?: string[] | null
          speed_score?: number | null
          strengths?: string[] | null
          technique_score?: number | null
          video_id: string
          weaknesses?: string[] | null
        }
        Update: {
          ai_confidence?: number | null
          analysis_data?: Json | null
          athlete_id?: string
          created_at?: string
          detailed_feedback?: string | null
          endurance_score?: number | null
          flexibility_score?: number | null
          id?: string
          overall_score?: number
          power_score?: number | null
          recommendations?: string[] | null
          speed_score?: number | null
          strengths?: string[] | null
          technique_score?: number | null
          video_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          achievements: string[] | null
          coach_id: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          experience_years: number | null
          height_cm: number | null
          id: string
          is_active: boolean | null
          medical_conditions: string[] | null
          preferred_position: string | null
          primary_sport: Database["public"]["Enums"]["sport_type"]
          profile_id: string
          secondary_sports: Database["public"]["Enums"]["sport_type"][] | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          achievements?: string[] | null
          coach_id?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          experience_years?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          medical_conditions?: string[] | null
          preferred_position?: string | null
          primary_sport: Database["public"]["Enums"]["sport_type"]
          profile_id: string
          secondary_sports?: Database["public"]["Enums"]["sport_type"][] | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          achievements?: string[] | null
          coach_id?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          experience_years?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          medical_conditions?: string[] | null
          preferred_position?: string | null
          primary_sport?: Database["public"]["Enums"]["sport_type"]
          profile_id?: string
          secondary_sports?: Database["public"]["Enums"]["sport_type"][] | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "athletes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          certifications: string[] | null
          coaching_philosophy: string | null
          created_at: string
          experience_years: number | null
          id: string
          is_verified: boolean | null
          languages: string[] | null
          max_athletes: number | null
          profile_id: string
          rating: number | null
          specialization: Database["public"]["Enums"]["sport_type"][]
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: string[] | null
          coaching_philosophy?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          max_athletes?: number | null
          profile_id: string
          rating?: number | null
          specialization: Database["public"]["Enums"]["sport_type"][]
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: string[] | null
          coaching_philosophy?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          max_athletes?: number | null
          profile_id?: string
          rating?: number | null
          specialization?: Database["public"]["Enums"]["sport_type"][]
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          athlete_id: string
          category: string | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          is_completed: boolean | null
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          athlete_id: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          athlete_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          athlete_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          athlete_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string
          user_id: string
          village_city: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id: string
          village_city?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id?: string
          village_city?: string | null
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          athlete_id: string
          coach_id: string | null
          created_at: string
          description: string | null
          difficulty_level: number | null
          duration_weeks: number | null
          goals: string[] | null
          id: string
          is_active: boolean | null
          plan_data: Json
          progress_percentage: number | null
          sport_type: Database["public"]["Enums"]["sport_type"]
          title: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          duration_weeks?: number | null
          goals?: string[] | null
          id?: string
          is_active?: boolean | null
          plan_data: Json
          progress_percentage?: number | null
          sport_type: Database["public"]["Enums"]["sport_type"]
          title: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          duration_weeks?: number | null
          goals?: string[] | null
          id?: string
          is_active?: boolean | null
          plan_data?: Json
          progress_percentage?: number | null
          sport_type?: Database["public"]["Enums"]["sport_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["user_id"]
          },
        ]
      }
      videos: {
        Row: {
          athlete_id: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size_mb: number | null
          id: string
          is_analyzed: boolean | null
          sport_type: Database["public"]["Enums"]["sport_type"]
          title: string
          updated_at: string
          upload_status: string | null
          video_type: string
          video_url: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          id?: string
          is_analyzed?: boolean | null
          sport_type: Database["public"]["Enums"]["sport_type"]
          title: string
          updated_at?: string
          upload_status?: string | null
          video_type: string
          video_url: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          id?: string
          is_analyzed?: boolean | null
          sport_type?: Database["public"]["Enums"]["sport_type"]
          title?: string
          updated_at?: string
          upload_status?: string | null
          video_type?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender: "male" | "female" | "other"
      sport_type:
        | "cricket"
        | "football"
        | "basketball"
        | "athletics"
        | "swimming"
        | "badminton"
        | "tennis"
        | "volleyball"
        | "hockey"
        | "other"
      user_role: "athlete" | "coach" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gender: ["male", "female", "other"],
      sport_type: [
        "cricket",
        "football",
        "basketball",
        "athletics",
        "swimming",
        "badminton",
        "tennis",
        "volleyball",
        "hockey",
        "other",
      ],
      user_role: ["athlete", "coach", "admin"],
    },
  },
} as const
