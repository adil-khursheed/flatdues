export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expense_splits: {
        Row: {
          created_at: string
          expense_id: string
          share_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expense_id: string
          share_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          expense_id?: string
          share_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          expense_date: string
          id: string
          notes: string | null
          payer_id: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          created_by: string
          expense_date: string
          id?: string
          notes?: string | null
          payer_id: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payer_id?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_creator_membership_fk"
            columns: ["workspace_id", "created_by"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "expenses_payer_membership_fk"
            columns: ["workspace_id", "payer_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "expenses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budgets: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          month_start: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          month_start: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          month_start?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budgets_creator_membership_fk"
            columns: ["workspace_id", "created_by"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "monthly_budgets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          from_user_id: string
          id: string
          notes: string | null
          settled_at: string
          to_user_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          from_user_id: string
          id?: string
          notes?: string | null
          settled_at?: string
          to_user_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          from_user_id?: string
          id?: string
          notes?: string | null
          settled_at?: string
          to_user_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_creator_membership_fk"
            columns: ["workspace_id", "created_by"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "settlements_from_membership_fk"
            columns: ["workspace_id", "from_user_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "settlements_to_membership_fk"
            columns: ["workspace_id", "to_user_id"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "settlements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          revoked_at: string | null
          token: string
          updated_at: string
          usage_count: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          revoked_at?: string | null
          token?: string
          updated_at?: string
          usage_count?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          revoked_at?: string | null
          token?: string
          updated_at?: string
          usage_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_creator_membership_fk"
            columns: ["workspace_id", "created_by"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["workspace_id", "user_id"]
          },
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          deactivated_at: string | null
          joined_at: string
          role: string
          status: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          deactivated_at?: string | null
          joined_at?: string
          role?: string
          status?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          deactivated_at?: string | null
          joined_at?: string
          role?: string
          status?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string
          currency_code: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency_code?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency_code?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_expense: {
        Args: {
          p_amount: number
          p_category: string
          p_expense_date: string
          p_notes: string
          p_participant_ids: string[]
          p_payer_id: string
          p_title: string
          p_workspace_id: string
        }
        Returns: {
          amount: number
          category: string
          created_at: string
          created_by: string
          expense_date: string
          id: string
          notes: string | null
          payer_id: string
          title: string
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "expenses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_workspace: {
        Args: { p_currency_code?: string; p_name: string }
        Returns: {
          created_at: string
          created_by: string
          currency_code: string
          id: string
          name: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "workspaces"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_workspace_invite: {
        Args: {
          p_expires_in_days: number
          p_max_uses: number
          p_workspace_id: string
        }
        Returns: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          revoked_at: string | null
          token: string
          updated_at: string
          usage_count: number
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_invites"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_expense: { Args: { p_expense_id: string }; Returns: string }
      generate_workspace_invite: {
        Args: {
          p_expires_at?: string
          p_max_uses?: number
          p_workspace_id: string
        }
        Returns: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          revoked_at: string | null
          token: string
          updated_at: string
          usage_count: number
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_invites"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_daily_spending: {
        Args: { p_local_date: string; p_workspace_id: string }
        Returns: number
      }
      get_monthly_spending: {
        Args: { p_month_start: string; p_workspace_id: string }
        Returns: number
      }
      get_recent_activity: {
        Args: { p_limit?: number; p_workspace_id: string }
        Returns: {
          activity_date: string
          activity_id: string
          activity_type: string
          actor_display_name: string
          actor_id: string
          amount: number
          category: string
          from_display_name: string
          from_user_id: string
          occurred_at: string
          title: string
          to_display_name: string
          to_user_id: string
        }[]
      }
      get_workspace_balances: {
        Args: { p_workspace_id: string }
        Returns: {
          balance: number
          display_name: string
          paid_total: number
          settlements_received: number
          settlements_sent: number
          share_total: number
          user_id: string
        }[]
      }
      join_workspace_by_invite: {
        Args: { p_token: string }
        Returns: {
          deactivated_at: string | null
          joined_at: string
          role: string
          status: string
          user_id: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      leave_workspace: {
        Args: { p_workspace_id: string }
        Returns: {
          deactivated_at: string | null
          joined_at: string
          role: string
          status: string
          user_id: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      manage_workspace_member: {
        Args: {
          p_role?: string
          p_status?: string
          p_user_id: string
          p_workspace_id: string
        }
        Returns: {
          deactivated_at: string | null
          joined_at: string
          role: string
          status: string
          user_id: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      revoke_workspace_invite: {
        Args: { p_invite_id: string; p_workspace_id: string }
        Returns: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          revoked_at: string | null
          token: string
          updated_at: string
          usage_count: number
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_invites"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_expense: {
        Args: {
          p_amount: number
          p_category: string
          p_expense_date: string
          p_expense_id: string
          p_notes: string
          p_participant_ids: string[]
          p_payer_id: string
          p_title: string
        }
        Returns: {
          amount: number
          category: string
          created_at: string
          created_by: string
          expense_date: string
          id: string
          notes: string | null
          payer_id: string
          title: string
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "expenses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
