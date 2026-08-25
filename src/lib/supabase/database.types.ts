export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Generated-schema placeholder for Phase 2. Run `pnpm types:supabase` after
 * linking the local Supabase project; do not add hand-written table types here.
 */
export type Database = {
  public: {
    CompositeTypes: Record<never, never>;
    Enums: Record<never, never>;
    Functions: Record<never, never>;
    Tables: Record<never, never>;
    Views: Record<never, never>;
  };
};
