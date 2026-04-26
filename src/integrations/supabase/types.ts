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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          category: string | null
          created_at: string
          detail: string | null
          id: string
          message: string
          type: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          message: string
          type?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          message?: string
          type?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          description: string
          engine: string
          id: string
          last_run: string | null
          memory: string | null
          model: string | null
          name: string
          status: string
          success_rate: number
          total_runs: number
          type: string
        }
        Insert: {
          created_at?: string
          description?: string
          engine?: string
          id?: string
          last_run?: string | null
          memory?: string | null
          model?: string | null
          name: string
          status?: string
          success_rate?: number
          total_runs?: number
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          engine?: string
          id?: string
          last_run?: string | null
          memory?: string | null
          model?: string | null
          name?: string
          status?: string
          success_rate?: number
          total_runs?: number
          type?: string
        }
        Relationships: []
      }
      automation_steps: {
        Row: {
          automation_id: string
          condition: string | null
          config: Json
          duration: string | null
          id: string
          kind: string
          name: string
          retry_config: Json | null
          status: string
          step_order: number
        }
        Insert: {
          automation_id: string
          condition?: string | null
          config?: Json
          duration?: string | null
          id?: string
          kind?: string
          name: string
          retry_config?: Json | null
          status?: string
          step_order?: number
        }
        Update: {
          automation_id?: string
          condition?: string | null
          config?: Json
          duration?: string | null
          id?: string
          kind?: string
          name?: string
          retry_config?: Json | null
          status?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "automation_steps_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          created_at: string
          description: string
          id: string
          last_run: string | null
          name: string
          status: string
          total_runs: number
          trigger: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          last_run?: string | null
          name: string
          status?: string
          total_runs?: number
          trigger?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          last_run?: string | null
          name?: string
          status?: string
          total_runs?: number
          trigger?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          agent_id: string
          content?: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      engines: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          installed: boolean
          language: string | null
          name: string
          slug: string
          stars: string | null
          url: string | null
          verified: boolean
          version: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          installed?: boolean
          language?: string | null
          name: string
          slug: string
          stars?: string | null
          url?: string | null
          verified?: boolean
          version?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          installed?: boolean
          language?: string | null
          name?: string
          slug?: string
          stars?: string | null
          url?: string | null
          verified?: boolean
          version?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          connected_at: string | null
          created_at: string
          icon: string
          id: string
          metadata: Json | null
          name: string
          status: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          icon?: string
          id: string
          metadata?: Json | null
          name: string
          status?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          icon?: string
          id?: string
          metadata?: Json | null
          name?: string
          status?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          agent_name: string | null
          automation_id: string
          automation_name: string
          completed_at: string | null
          duration: string | null
          id: string
          logs: Json
          started_at: string
          status: string
          steps: number
          steps_completed: number
          trigger: string
        }
        Insert: {
          agent_name?: string | null
          automation_id: string
          automation_name?: string
          completed_at?: string | null
          duration?: string | null
          id?: string
          logs?: Json
          started_at?: string
          status?: string
          steps?: number
          steps_completed?: number
          trigger?: string
        }
        Update: {
          agent_name?: string | null
          automation_id?: string
          automation_name?: string
          completed_at?: string | null
          duration?: string | null
          id?: string
          logs?: Json
          started_at?: string
          status?: string
          steps?: number
          steps_completed?: number
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      secrets: {
        Row: {
          created_at: string
          id: string
          last_used: string | null
          name: string
          used_by: number
          value_hint: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_used?: string | null
          name: string
          used_by?: number
          value_hint?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_used?: string | null
          name?: string
          used_by?: number
          value_hint?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      step_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          kind: string
          name: string
          output: Json | null
          run_id: string
          started_at: string | null
          status: string
          step_id: string | null
          step_order: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          kind?: string
          name?: string
          output?: Json | null
          run_id: string
          started_at?: string | null
          status?: string
          step_id?: string | null
          step_order?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          kind?: string
          name?: string
          output?: Json | null
          run_id?: string
          started_at?: string | null
          status?: string
          step_id?: string | null
          step_order?: number
        }
        Relationships: []
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
