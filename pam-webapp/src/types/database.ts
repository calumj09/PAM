export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          state_territory: string | null
          postcode: string | null
          created_at: string
        }
        Insert: {
          id: string
          state_territory?: string | null
          postcode?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          state_territory?: string | null
          postcode?: string | null
          created_at?: string
        }
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          date_of_birth: string
          is_premium_feature: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date_of_birth: string
          is_premium_feature?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date_of_birth?: string
          is_premium_feature?: boolean
        }
      }
      checklist_items: {
        Row: {
          id: string
          child_id: string
          title: string
          description: string | null
          due_date: string | null
          category: 'immunisation' | 'registration' | 'milestone' | 'checkup'
          is_completed: boolean
          completed_date: string | null
        }
        Insert: {
          id?: string
          child_id: string
          title: string
          description?: string | null
          due_date?: string | null
          category: 'immunisation' | 'registration' | 'milestone' | 'checkup'
          is_completed?: boolean
          completed_date?: string | null
        }
        Update: {
          id?: string
          child_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          category?: 'immunisation' | 'registration' | 'milestone' | 'checkup'
          is_completed?: boolean
          completed_date?: string | null
        }
      }
    }
  }
}