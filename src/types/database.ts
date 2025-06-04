export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          name: string
          email: string
          address: string
          whatsapp: string
          categories: string[]
          price: number
          payment_status: 'PAID' | 'UNPAID'
          payment_id?: string
          barcode_url?: string
          receipt_url?: string
          participant_number?: string
          representative_name?: string
          representative_wa?: string
          souvenir_received: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          address: string
          whatsapp: string
          categories: string[]
          price: number
          payment_status?: 'PAID' | 'UNPAID'
          payment_id?: string
          barcode_url?: string
          receipt_url?: string
          participant_number?: string
          representative_name?: string
          representative_wa?: string
          souvenir_received?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          address?: string
          whatsapp?: string
          categories?: string[]
          price?: number
          payment_status?: 'PAID' | 'UNPAID'
          payment_id?: string
          barcode_url?: string
          receipt_url?: string
          participant_number?: string
          representative_name?: string
          representative_wa?: string
          souvenir_received?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          role: 'admin' | 'superadmin'
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          role: 'admin' | 'superadmin'
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          role?: 'admin' | 'superadmin'
        }
      }
      settings: {
        Row: {
          id: number
          homepage_title: string
          homepage_location: string
          homepage_banner_url: string
          xendit_api_key: string
          whatsapp_api_key: string
          whatsapp_template: string
        }
        Insert: {
          id?: number
          homepage_title: string
          homepage_location: string
          homepage_banner_url: string
          xendit_api_key: string
          whatsapp_api_key: string
          whatsapp_template: string
        }
        Update: {
          id?: number
          homepage_title?: string
          homepage_location?: string
          homepage_banner_url?: string
          xendit_api_key?: string
          whatsapp_api_key?: string
          whatsapp_template?: string
        }
      }
    }
    Functions: {
      create_participants_table_if_not_exists: {
        Args: Record<string, never>
        Returns: undefined
      }
      create_admins_table_if_not_exists: {
        Args: Record<string, never>
        Returns: undefined
      }
      create_settings_table_if_not_exists: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
  }
}