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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          avatar_emoji: string
          created_at: string
          id: string
          is_group: boolean
          name: string
          order_index: number
          role_label: string
          unread_count: number
          user_simulation_id: string
        }
        Insert: {
          avatar_emoji?: string
          created_at?: string
          id?: string
          is_group?: boolean
          name: string
          order_index?: number
          role_label: string
          unread_count?: number
          user_simulation_id: string
        }
        Update: {
          avatar_emoji?: string
          created_at?: string
          id?: string
          is_group?: boolean
          name?: string
          order_index?: number
          role_label?: string
          unread_count?: number
          user_simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_simulation_id_fkey"
            columns: ["user_simulation_id"]
            isOneToOne: false
            referencedRelation: "user_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body: string
          cc_addresses: string[]
          folder: string
          from_email: string
          from_name: string
          id: string
          is_read: boolean
          received_at: string
          subject: string
          to_addresses: string[]
          user_simulation_id: string
        }
        Insert: {
          body: string
          cc_addresses?: string[]
          folder?: string
          from_email: string
          from_name: string
          id?: string
          is_read?: boolean
          received_at?: string
          subject: string
          to_addresses?: string[]
          user_simulation_id: string
        }
        Update: {
          body?: string
          cc_addresses?: string[]
          folder?: string
          from_email?: string
          from_name?: string
          id?: string
          is_read?: boolean
          received_at?: string
          subject?: string
          to_addresses?: string[]
          user_simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_user_simulation_id_fkey"
            columns: ["user_simulation_id"]
            isOneToOne: false
            referencedRelation: "user_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_size: string | null
          file_url: string | null
          id: string
          message_type: string
          sender: string
          task_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender: string
          task_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          plan: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          plan?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          code: string
          company: string
          cover_emoji: string
          created_at: string
          description: string
          difficulty: string
          duration_label: string
          id: string
          is_pro: boolean
          order_index: number
          role: string
          title: string
          track: string
        }
        Insert: {
          code: string
          company: string
          cover_emoji?: string
          created_at?: string
          description: string
          difficulty?: string
          duration_label?: string
          id?: string
          is_pro?: boolean
          order_index?: number
          role: string
          title: string
          track: string
        }
        Update: {
          code?: string
          company?: string
          cover_emoji?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration_label?: string
          id?: string
          is_pro?: boolean
          order_index?: number
          role?: string
          title?: string
          track?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignment_message: string
          boss_commentary: string
          brief: string
          deadline_hours: number
          feedback_message: string
          id: string
          order_index: number
          requirements: Json
          score: number
          scoring_rubric: Json
          simulation_id: string
          standard_answer: string
          title: string
        }
        Insert: {
          assignment_message: string
          boss_commentary?: string
          brief: string
          deadline_hours?: number
          feedback_message: string
          id?: string
          order_index: number
          requirements?: Json
          score?: number
          scoring_rubric?: Json
          simulation_id: string
          standard_answer: string
          title: string
        }
        Update: {
          assignment_message?: string
          boss_commentary?: string
          brief?: string
          deadline_hours?: number
          feedback_message?: string
          id?: string
          order_index?: number
          requirements?: Json
          score?: number
          scoring_rubric?: Json
          simulation_id?: string
          standard_answer?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_simulations: {
        Row: {
          completed_at: string | null
          current_task_index: number
          id: string
          offer_accepted: boolean
          progress: number
          simulation_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_task_index?: number
          id?: string
          offer_accepted?: boolean
          progress?: number
          simulation_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_task_index?: number
          id?: string
          offer_accepted?: boolean
          progress?: number
          simulation_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_simulations_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_task_progress: {
        Row: {
          feedback_seen: boolean
          id: string
          review_summary: string | null
          score: number | null
          self_eval: Json | null
          status: string
          submission_quality: string
          submission_type: string | null
          submitted_at: string | null
          submitted_file_url: string | null
          submitted_filename: string | null
          task_id: string
          user_simulation_id: string
        }
        Insert: {
          feedback_seen?: boolean
          id?: string
          review_summary?: string | null
          score?: number | null
          self_eval?: Json | null
          status?: string
          submission_quality?: string
          submission_type?: string | null
          submitted_at?: string | null
          submitted_file_url?: string | null
          submitted_filename?: string | null
          task_id: string
          user_simulation_id: string
        }
        Update: {
          feedback_seen?: boolean
          id?: string
          review_summary?: string | null
          score?: number | null
          self_eval?: Json | null
          status?: string
          submission_quality?: string
          submission_type?: string | null
          submitted_at?: string | null
          submitted_file_url?: string | null
          submitted_filename?: string | null
          task_id?: string
          user_simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_progress_user_simulation_id_fkey"
            columns: ["user_simulation_id"]
            isOneToOne: false
            referencedRelation: "user_simulations"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
