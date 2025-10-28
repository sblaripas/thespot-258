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
      categories: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_pt: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_en: string
          name_pt: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_pt?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en: string
          name_pt: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_pt?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en?: string
          name_pt?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          assigned_zones: string[] | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          language_preference: string | null
          last_login: string | null
          name: string
          phone: string | null
          pin_hash: string | null
          role_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_zones?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          language_preference?: string | null
          last_login?: string | null
          name: string
          phone?: string | null
          pin_hash?: string | null
          role_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_zones?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          language_preference?: string | null
          last_login?: string | null
          name?: string
          phone?: string | null
          pin_hash?: string | null
          role_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string | null
          current_stock: number | null
          id: string
          is_active: boolean | null
          min_stock_level: number | null
          name: string
          notes: string | null
          supplier_id: string | null
          tenant_id: string
          unit: string
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          current_stock?: number | null
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          name: string
          notes?: string | null
          supplier_id?: string | null
          tenant_id: string
          unit: string
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          current_stock?: number | null
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          name?: string
          notes?: string | null
          supplier_id?: string | null
          tenant_id?: string
          unit?: string
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_logs: {
        Row: {
          change_amount: number
          change_type: string
          cost_impact: number | null
          created_at: string | null
          employee_id: string | null
          id: string
          menu_item_id: string | null
          new_stock: number
          previous_stock: number
          reason_en: string | null
          reason_pt: string | null
          reference_id: string | null
          tenant_id: string
        }
        Insert: {
          change_amount: number
          change_type: string
          cost_impact?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          menu_item_id?: string | null
          new_stock: number
          previous_stock: number
          reason_en?: string | null
          reason_pt?: string | null
          reference_id?: string | null
          tenant_id: string
        }
        Update: {
          change_amount?: number
          change_type?: string
          cost_impact?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          menu_item_id?: string | null
          new_stock?: number
          previous_stock?: number
          reason_en?: string | null
          reason_pt?: string | null
          reference_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_logs_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allow_out_of_stock_orders: boolean | null
          category_id: string | null
          cost_price: number
          created_at: string | null
          description_en: string | null
          description_pt: string | null
          discount_price: number | null
          event_eligible: boolean | null
          id: string
          image_url: string | null
          inventory_item_id: string | null
          is_available: boolean | null
          low_stock_threshold: number | null
          name_en: string
          name_pt: string
          preparation_time: number | null
          selling_price: number
          show_discount: boolean | null
          size: string | null
          stock_count: number | null
          tags: string[] | null
          tenant_id: string
          track_stock: boolean | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          allow_out_of_stock_orders?: boolean | null
          category_id?: string | null
          cost_price: number
          created_at?: string | null
          description_en?: string | null
          description_pt?: string | null
          discount_price?: number | null
          event_eligible?: boolean | null
          id?: string
          image_url?: string | null
          inventory_item_id?: string | null
          is_available?: boolean | null
          low_stock_threshold?: number | null
          name_en: string
          name_pt: string
          preparation_time?: number | null
          selling_price: number
          show_discount?: boolean | null
          size?: string | null
          stock_count?: number | null
          tags?: string[] | null
          tenant_id: string
          track_stock?: boolean | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          allow_out_of_stock_orders?: boolean | null
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          description_en?: string | null
          description_pt?: string | null
          discount_price?: number | null
          event_eligible?: boolean | null
          id?: string
          image_url?: string | null
          inventory_item_id?: string | null
          is_available?: boolean | null
          low_stock_threshold?: number | null
          name_en?: string
          name_pt?: string
          preparation_time?: number | null
          selling_price?: number
          show_discount?: boolean | null
          size?: string | null
          stock_count?: number | null
          tags?: string[] | null
          tenant_id?: string
          track_stock?: boolean | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_items_inventory"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          cost_price_at_time: number
          created_at: string | null
          id: string
          menu_item_id: string | null
          order_id: string
          quantity: number
          selling_price_at_time: number
          special_instructions_en: string | null
          special_instructions_pt: string | null
          status: string | null
          subtotal: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          cost_price_at_time: number
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id: string
          quantity: number
          selling_price_at_time: number
          special_instructions_en?: string | null
          special_instructions_pt?: string | null
          status?: string | null
          subtotal?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          cost_price_at_time?: number
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          selling_price_at_time?: number
          special_instructions_en?: string | null
          special_instructions_pt?: string | null
          status?: string | null
          subtotal?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_id: string | null
          customer_notes: string | null
          discount_amount: number | null
          estimated_prep_time: number | null
          guest_count: number | null
          id: string
          notes_en: string | null
          notes_pt: string | null
          order_number: string
          placed_at: string | null
          prepared_at: string | null
          served_at: string | null
          status: string | null
          subtotal: number | null
          table_id: string | null
          tax_amount: number | null
          tenant_id: string
          total_amount: number | null
          type: string | null
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          discount_amount?: number | null
          estimated_prep_time?: number | null
          guest_count?: number | null
          id?: string
          notes_en?: string | null
          notes_pt?: string | null
          order_number: string
          placed_at?: string | null
          prepared_at?: string | null
          served_at?: string | null
          status?: string | null
          subtotal?: number | null
          table_id?: string | null
          tax_amount?: number | null
          tenant_id: string
          total_amount?: number | null
          type?: string | null
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          discount_amount?: number | null
          estimated_prep_time?: number | null
          guest_count?: number | null
          id?: string
          notes_en?: string | null
          notes_pt?: string | null
          order_number?: string
          placed_at?: string | null
          prepared_at?: string | null
          served_at?: string | null
          status?: string | null
          subtotal?: number | null
          table_id?: string | null
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number | null
          type?: string | null
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          bill_number: string
          card_last_four: string | null
          cashier_id: string | null
          change_amount: number | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          paid_at: string | null
          payment_method: string
          payment_status: string | null
          tenant_id: string
          tip_amount: number | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          bill_number: string
          card_last_four?: string | null
          cashier_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          paid_at?: string | null
          payment_method: string
          payment_status?: string | null
          tenant_id: string
          tip_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          bill_number?: string
          card_last_four?: string | null
          cashier_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string | null
          tenant_id?: string
          tip_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          is_active: boolean | null
          location_zone: string | null
          max_capacity: number | null
          min_capacity: number | null
          name_en: string | null
          name_pt: string | null
          number: string
          position_x: number | null
          position_y: number | null
          qr_code_url: string | null
          shape: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_zone?: string | null
          max_capacity?: number | null
          min_capacity?: number | null
          name_en?: string | null
          name_pt?: string | null
          number: string
          position_x?: number | null
          position_y?: number | null
          qr_code_url?: string | null
          shape?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_zone?: string | null
          max_capacity?: number | null
          min_capacity?: number | null
          name_en?: string | null
          name_pt?: string | null
          number?: string
          position_x?: number | null
          position_y?: number | null
          qr_code_url?: string | null
          shape?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          access_level: number | null
          can_issue_vouchers: boolean | null
          can_manage_inventory: boolean | null
          can_manage_menu: boolean | null
          can_manage_orders: boolean | null
          can_manage_qr_menus: boolean | null
          can_manage_settings: boolean | null
          can_manage_staff: boolean | null
          can_manage_tables: boolean | null
          can_view_reports: boolean | null
          color: string | null
          created_at: string | null
          id: string
          name_en: string
          name_pt: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          access_level?: number | null
          can_issue_vouchers?: boolean | null
          can_manage_inventory?: boolean | null
          can_manage_menu?: boolean | null
          can_manage_orders?: boolean | null
          can_manage_qr_menus?: boolean | null
          can_manage_settings?: boolean | null
          can_manage_staff?: boolean | null
          can_manage_tables?: boolean | null
          can_view_reports?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: string
          name_en: string
          name_pt: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          access_level?: number | null
          can_issue_vouchers?: boolean | null
          can_manage_inventory?: boolean | null
          can_manage_menu?: boolean | null
          can_manage_orders?: boolean | null
          can_manage_qr_menus?: boolean | null
          can_manage_settings?: boolean | null
          can_manage_staff?: boolean | null
          can_manage_tables?: boolean | null
          can_view_reports?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: string
          name_en?: string
          name_pt?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          actual_cash: number | null
          cash_difference: number | null
          closing_balance: number | null
          created_at: string | null
          employee_id: string | null
          end_time: string | null
          expected_cash: number | null
          id: string
          notes: string | null
          opening_balance: number | null
          shift_number: string
          start_time: string
          status: string | null
          tenant_id: string
          total_orders: number | null
          total_sales: number | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          actual_cash?: number | null
          cash_difference?: number | null
          closing_balance?: number | null
          created_at?: string | null
          employee_id?: string | null
          end_time?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opening_balance?: number | null
          shift_number: string
          start_time: string
          status?: string | null
          tenant_id: string
          total_orders?: number | null
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_cash?: number | null
          cash_difference?: number | null
          closing_balance?: number | null
          created_at?: string | null
          employee_id?: string | null
          end_time?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opening_balance?: number | null
          shift_number?: string
          start_time?: string
          status?: string | null
          tenant_id?: string
          total_orders?: number | null
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          features_enabled: Json | null
          id: string
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          features_enabled?: Json | null
          id?: string
          start_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          features_enabled?: Json | null
          id?: string
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          nuit: string | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          nuit?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          nuit?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      table_reservations: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          party_size: number
          reservation_time: string
          status: string | null
          table_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          party_size: number
          reservation_time: string
          status?: string | null
          table_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          party_size?: number
          reservation_time?: string
          status?: string | null
          table_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_reservations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_reservations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          auto_table_status: boolean | null
          closing_time: string | null
          created_at: string | null
          date_format: string | null
          default_language: string | null
          languages: string[] | null
          opening_time: string | null
          receipt_footer_en: string | null
          receipt_footer_pt: string | null
          receipt_header_en: string | null
          receipt_header_pt: string | null
          receipt_show_tax: boolean | null
          table_timeout_minutes: number | null
          tax_enabled: boolean | null
          tax_name: string | null
          tax_rate: number | null
          tenant_id: string
          time_format: string | null
          updated_at: string | null
        }
        Insert: {
          auto_table_status?: boolean | null
          closing_time?: string | null
          created_at?: string | null
          date_format?: string | null
          default_language?: string | null
          languages?: string[] | null
          opening_time?: string | null
          receipt_footer_en?: string | null
          receipt_footer_pt?: string | null
          receipt_header_en?: string | null
          receipt_header_pt?: string | null
          receipt_show_tax?: boolean | null
          table_timeout_minutes?: number | null
          tax_enabled?: boolean | null
          tax_name?: string | null
          tax_rate?: number | null
          tenant_id: string
          time_format?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_table_status?: boolean | null
          closing_time?: string | null
          created_at?: string | null
          date_format?: string | null
          default_language?: string | null
          languages?: string[] | null
          opening_time?: string | null
          receipt_footer_en?: string | null
          receipt_footer_pt?: string | null
          receipt_header_en?: string | null
          receipt_header_pt?: string | null
          receipt_show_tax?: boolean | null
          table_timeout_minutes?: number | null
          tax_enabled?: boolean | null
          tax_name?: string | null
          tax_rate?: number | null
          tenant_id?: string
          time_format?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          base_language: string | null
          city: string
          created_at: string | null
          currency: string | null
          domain: string
          email: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          licenca: string | null
          name: string
          nuit: string | null
          phone: string | null
          province: string
          subscription_tier: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          base_language?: string | null
          city: string
          created_at?: string | null
          currency?: string | null
          domain: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          licenca?: string | null
          name: string
          nuit?: string | null
          phone?: string | null
          province: string
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          base_language?: string | null
          city?: string
          created_at?: string | null
          currency?: string | null
          domain?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          licenca?: string | null
          name?: string
          nuit?: string | null
          phone?: string | null
          province?: string
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          amount: number
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          qr_code: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          amount: number
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          qr_code: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          qr_code?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          order_id: string | null
          transaction_type: string
          voucher_id: string | null
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          transaction_type: string
          voucher_id?: string | null
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          transaction_type?: string
          voucher_id?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          client_name: string | null
          client_phone: string
          created_at: string | null
          id: string
          is_active: boolean | null
          tenant_id: string
          total_credits: number | null
          total_debits: number | null
          updated_at: string | null
          voucher_id: string | null
        }
        Insert: {
          balance?: number | null
          client_name?: string | null
          client_phone: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          tenant_id: string
          total_credits?: number | null
          total_debits?: number | null
          updated_at?: string | null
          voucher_id?: string | null
        }
        Update: {
          balance?: number | null
          client_name?: string | null
          client_phone?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          tenant_id?: string
          total_credits?: number | null
          total_debits?: number | null
          updated_at?: string | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
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
