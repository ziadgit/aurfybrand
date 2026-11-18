export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  _agent: {
    Tables: {
      schema_migrations: {
        Row: {
          applied_at: string
          name: string
          version: string
        }
        Insert: {
          applied_at?: string
          name: string
          version: string
        }
        Update: {
          applied_at?: string
          name?: string
          version?: string
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
  _ai_gateway: {
    Tables: {
      gw_default_user_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          deleted_at: string | null
          enabled: boolean
          id: number
          tenant_name: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: string
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          tenant_name: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          tenant_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gw_kong_custom_routes: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gw_kong_custom_routes_meta: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      gw_model_configs: {
        Row: {
          created_at: string
          deleted_at: string | null
          enabled: boolean
          endpoint: string | null
          id: number
          name: string
          provider: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          endpoint?: string | null
          id?: number
          name: string
          provider: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          endpoint?: string | null
          id?: number
          name?: string
          provider?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      gw_providers: {
        Row: {
          api_key_enc: string
          base_url: string
          created_at: string
          enabled: boolean
          id: number
          models: string
          name: string
          type: string
          updated_at: string
          weight: number
        }
        Insert: {
          api_key_enc: string
          base_url: string
          created_at?: string
          enabled?: boolean
          id?: number
          models?: string
          name: string
          type?: string
          updated_at?: string
          weight?: number
        }
        Update: {
          api_key_enc?: string
          base_url?: string
          created_at?: string
          enabled?: boolean
          id?: number
          models?: string
          name?: string
          type?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      gw_rate_limits: {
        Row: {
          created_at: string
          enabled: boolean
          id: number
          request_current_usage: number
          request_last_reset: string
          request_max_limit: number
          request_reset_duration: string
          tenant_name: string | null
          token_current_usage: number
          token_last_reset: string
          token_max_limit: number
          token_reset_duration: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: number
          request_current_usage?: number
          request_last_reset?: string
          request_max_limit?: number
          request_reset_duration?: string
          tenant_name?: string | null
          token_current_usage?: number
          token_last_reset?: string
          token_max_limit?: number
          token_reset_duration?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: number
          request_current_usage?: number
          request_last_reset?: string
          request_max_limit?: number
          request_reset_duration?: string
          tenant_name?: string | null
          token_current_usage?: number
          token_last_reset?: string
          token_max_limit?: number
          token_reset_duration?: string
          updated_at?: string
        }
        Relationships: []
      }
      gw_supabase_instances: {
        Row: {
          anon_key: string
          base_url: string
          created_at: string
          deleted_at: string | null
          enabled: boolean
          id: number
          name: string | null
          supabase_branch_id: string
          tenant_name: string
          updated_at: string
        }
        Insert: {
          anon_key?: string
          base_url: string
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          name?: string | null
          supabase_branch_id: string
          tenant_name: string
          updated_at?: string
        }
        Update: {
          anon_key?: string
          base_url?: string
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          name?: string | null
          supabase_branch_id?: string
          tenant_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gw_tenants: {
        Row: {
          created_at: string
          deleted_at: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gw_usage_consume_history: {
        Row: {
          consumed_until_start_at: string
          created_at: string
          id: number
        }
        Insert: {
          consumed_until_start_at: string
          created_at?: string
          id?: number
        }
        Update: {
          consumed_until_start_at?: string
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      gw_usage_minute_summaries: {
        Row: {
          created_at: string
          end_at: string
          id: number
          image_mode: string
          input_length_type: string
          model: string
          provider: string
          start_at: string
          tenant_name: string
          total_requests: number
          usage_details: Json
          video_input_kind: string
          video_output_resolution: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: number
          image_mode?: string
          input_length_type?: string
          model: string
          provider?: string
          start_at: string
          tenant_name: string
          total_requests?: number
          usage_details?: Json
          video_input_kind?: string
          video_output_resolution?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: number
          image_mode?: string
          input_length_type?: string
          model?: string
          provider?: string
          start_at?: string
          tenant_name?: string
          total_requests?: number
          usage_details?: Json
          video_input_kind?: string
          video_output_resolution?: string
        }
        Relationships: []
      }
      gw_user_usage_quota: {
        Row: {
          created_at: string
          deleted_at: string | null
          enabled: boolean
          id: number
          image_limit_value: number
          image_use_default_limit: boolean
          image_used_value_all: number
          image_used_value_period: number
          limit_value: number
          metric: string
          period: string
          period_start_at: string
          tenant_name: string
          updated_at: string
          use_default_limit: boolean
          used_value_all: number
          used_value_period: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          image_limit_value?: number
          image_use_default_limit?: boolean
          image_used_value_all?: number
          image_used_value_period?: number
          limit_value?: number
          metric?: string
          period?: string
          period_start_at?: string
          tenant_name: string
          updated_at?: string
          use_default_limit?: boolean
          used_value_all?: number
          used_value_period?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          image_limit_value?: number
          image_use_default_limit?: boolean
          image_used_value_all?: number
          image_used_value_period?: number
          limit_value?: number
          metric?: string
          period?: string
          period_start_at?: string
          tenant_name?: string
          updated_at?: string
          use_default_limit?: boolean
          used_value_all?: number
          used_value_period?: number
          user_id?: string
        }
        Relationships: []
      }
      gw_user_usage_records: {
        Row: {
          auth_mode: string | null
          created_at: string
          endpoint: string | null
          id: number
          image_mode: string
          is_stream: boolean
          latency_ms: number
          model: string
          provider: string
          request_id: string | null
          request_type: string | null
          status_code: number
          tenant_name: string
          usage_detail: Json | null
          user_id: string | null
          video_input_kind: string
          video_output_resolution: string
        }
        Insert: {
          auth_mode?: string | null
          created_at?: string
          endpoint?: string | null
          id?: number
          image_mode?: string
          is_stream?: boolean
          latency_ms?: number
          model: string
          provider?: string
          request_id?: string | null
          request_type?: string | null
          status_code?: number
          tenant_name: string
          usage_detail?: Json | null
          user_id?: string | null
          video_input_kind?: string
          video_output_resolution?: string
        }
        Update: {
          auth_mode?: string | null
          created_at?: string
          endpoint?: string | null
          id?: number
          image_mode?: string
          is_stream?: boolean
          latency_ms?: number
          model?: string
          provider?: string
          request_id?: string | null
          request_type?: string | null
          status_code?: number
          tenant_name?: string
          usage_detail?: Json | null
          user_id?: string | null
          video_input_kind?: string
          video_output_resolution?: string
        }
        Relationships: []
      }
      gw_video_tasks: {
        Row: {
          actual_model: string
          actual_tokens: number
          ark_safety_identifier: string | null
          artifact_transfer_status: string | null
          billing_push_assume_success_at: string | null
          created_at: string
          deleted_at: string | null
          id: number
          output_resolution: string | null
          provider_account_id: string
          provider_last_attempt_at: string | null
          provider_last_seen_at: string | null
          provider_name: string
          provider_sync_reason: string | null
          provider_sync_since: string | null
          provider_sync_status: string | null
          provider_type: string
          public_model: string
          quota_subject: string
          reservation_expires_at: string
          reservation_period_start_at: string
          reservation_release_reason: string | null
          reservation_status: string
          reserved_tokens: number
          state_version: number
          status: string
          storage_last_frame_key: string | null
          storage_video_key: string | null
          task_id: string | null
          tenant_name: string
          terminal_reason: string | null
          updated_at: string
          usage_detail: Json | null
          usage_next_retry_at: string | null
          usage_status: string | null
          user_deleted_at: string | null
          user_id: string | null
          user_safety_identifier: string | null
          video_input_kind: string
        }
        Insert: {
          actual_model: string
          actual_tokens?: number
          ark_safety_identifier?: string | null
          artifact_transfer_status?: string | null
          billing_push_assume_success_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          output_resolution?: string | null
          provider_account_id: string
          provider_last_attempt_at?: string | null
          provider_last_seen_at?: string | null
          provider_name: string
          provider_sync_reason?: string | null
          provider_sync_since?: string | null
          provider_sync_status?: string | null
          provider_type: string
          public_model: string
          quota_subject: string
          reservation_expires_at: string
          reservation_period_start_at: string
          reservation_release_reason?: string | null
          reservation_status?: string
          reserved_tokens?: number
          state_version?: number
          status?: string
          storage_last_frame_key?: string | null
          storage_video_key?: string | null
          task_id?: string | null
          tenant_name: string
          terminal_reason?: string | null
          updated_at?: string
          usage_detail?: Json | null
          usage_next_retry_at?: string | null
          usage_status?: string | null
          user_deleted_at?: string | null
          user_id?: string | null
          user_safety_identifier?: string | null
          video_input_kind?: string
        }
        Update: {
          actual_model?: string
          actual_tokens?: number
          ark_safety_identifier?: string | null
          artifact_transfer_status?: string | null
          billing_push_assume_success_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          output_resolution?: string | null
          provider_account_id?: string
          provider_last_attempt_at?: string | null
          provider_last_seen_at?: string | null
          provider_name?: string
          provider_sync_reason?: string | null
          provider_sync_since?: string | null
          provider_sync_status?: string | null
          provider_type?: string
          public_model?: string
          quota_subject?: string
          reservation_expires_at?: string
          reservation_period_start_at?: string
          reservation_release_reason?: string | null
          reservation_status?: string
          reserved_tokens?: number
          state_version?: number
          status?: string
          storage_last_frame_key?: string | null
          storage_video_key?: string | null
          task_id?: string | null
          tenant_name?: string
          terminal_reason?: string | null
          updated_at?: string
          usage_detail?: Json | null
          usage_next_retry_at?: string | null
          usage_status?: string | null
          user_deleted_at?: string | null
          user_id?: string | null
          user_safety_identifier?: string | null
          video_input_kind?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          applied_at: string
          version: number
        }
        Insert: {
          applied_at?: string
          version: number
        }
        Update: {
          applied_at?: string
          version?: number
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
  _edge_function: {
    Tables: {
      code_snapshots: {
        Row: {
          body: string
          body_size: number
          checksum: string
          created_at: string
          function_id: number
          id: number
          revision_number: number | null
        }
        Insert: {
          body: string
          body_size: number
          checksum: string
          created_at?: string
          function_id: number
          id?: number
          revision_number?: number | null
        }
        Update: {
          body?: string
          body_size?: number
          checksum?: string
          created_at?: string
          function_id?: number
          id?: number
          revision_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "code_snapshots_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "vefunctions"
            referencedColumns: ["function_id"]
          },
        ]
      }
      functions_config: {
        Row: {
          cpu_milli: number
          function_quota: number
          id: number
          max_concurrency: number
          memory_mb: number
          request_timeout_sec: number
          updated_at: string
          websocket_handshake_timeout_sec: number
          websocket_idle_timeout_sec: number
          websocket_max_connection_duration_sec: number
          websocket_max_connections: number
          websocket_max_message_bytes: number
        }
        Insert: {
          cpu_milli?: number
          function_quota?: number
          id: number
          max_concurrency?: number
          memory_mb?: number
          request_timeout_sec?: number
          updated_at?: string
          websocket_handshake_timeout_sec?: number
          websocket_idle_timeout_sec?: number
          websocket_max_connection_duration_sec?: number
          websocket_max_connections?: number
          websocket_max_message_bytes?: number
        }
        Update: {
          cpu_milli?: number
          function_quota?: number
          id?: number
          max_concurrency?: number
          memory_mb?: number
          request_timeout_sec?: number
          updated_at?: string
          websocket_handshake_timeout_sec?: number
          websocket_idle_timeout_sec?: number
          websocket_max_connection_duration_sec?: number
          websocket_max_connections?: number
          websocket_max_message_bytes?: number
        }
        Relationships: []
      }
      invocation_results: {
        Row: {
          cost_time_ms: number | null
          cpu_time_used_ms: number | null
          created_at: string
          error_message: string | null
          event_message: string | null
          execution_time_ms: number | null
          function_slug: string | null
          id: number
          invocation: Json
          invocation_id: string
          is_error: boolean
          mem_used_bytes: number | null
          project_id: string | null
          status_code: number | null
          vefaas_function_id: string | null
        }
        Insert: {
          cost_time_ms?: number | null
          cpu_time_used_ms?: number | null
          created_at?: string
          error_message?: string | null
          event_message?: string | null
          execution_time_ms?: number | null
          function_slug?: string | null
          id?: number
          invocation: Json
          invocation_id: string
          is_error?: boolean
          mem_used_bytes?: number | null
          project_id?: string | null
          status_code?: number | null
          vefaas_function_id?: string | null
        }
        Update: {
          cost_time_ms?: number | null
          cpu_time_used_ms?: number | null
          created_at?: string
          error_message?: string | null
          event_message?: string | null
          execution_time_ms?: number | null
          function_slug?: string | null
          id?: number
          invocation?: Json
          invocation_id?: string
          is_error?: boolean
          mem_used_bytes?: number | null
          project_id?: string | null
          status_code?: number | null
          vefaas_function_id?: string | null
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          applied_at: string
          version: number
        }
        Insert: {
          applied_at?: string
          version: number
        }
        Update: {
          applied_at?: string
          version?: number
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      vefunctions: {
        Row: {
          created_at: string
          description: string | null
          entrypoint: string | null
          function_id: number
          import_map_path: string | null
          name: string
          project_id: string
          runtime: string
          runtime_config: Json | null
          slug: string
          status: string
          updated_at: string
          vefaas_function_id: string | null
          verify_jwt: boolean
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          entrypoint?: string | null
          function_id?: number
          import_map_path?: string | null
          name: string
          project_id: string
          runtime?: string
          runtime_config?: Json | null
          slug: string
          status?: string
          updated_at?: string
          vefaas_function_id?: string | null
          verify_jwt?: boolean
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          entrypoint?: string | null
          function_id?: number
          import_map_path?: string | null
          name?: string
          project_id?: string
          runtime?: string
          runtime_config?: Json | null
          slug?: string
          status?: string
          updated_at?: string
          vefaas_function_id?: string | null
          verify_jwt?: boolean
          version?: number
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
  _realtime: {
    Tables: {
      configurations: {
        Row: {
          business_id: string | null
          business_type: string | null
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          business_type?: string | null
          created_at?: string | null
          data: Json
          id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          business_type?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      extensions: {
        Row: {
          id: string
          inserted_at: string
          settings: Json | null
          tenant_external_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          id: string
          inserted_at: string
          settings?: Json | null
          tenant_external_id?: string | null
          type?: string | null
          updated_at: string
        }
        Update: {
          id?: string
          inserted_at?: string
          settings?: Json | null
          tenant_external_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extensions_tenant_external_id_fkey"
            columns: ["tenant_external_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["external_id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      tenants: {
        Row: {
          broadcast_adapter: string | null
          external_id: string | null
          id: string
          inserted_at: string
          jwt_jwks: Json | null
          jwt_secret: string | null
          max_bytes_per_second: number
          max_channels_per_client: number
          max_concurrent_users: number
          max_events_per_second: number
          max_joins_per_second: number
          max_payload_size_in_kb: number | null
          max_presence_events_per_second: number | null
          migrations_ran: number | null
          name: string | null
          notify_private_alpha: boolean | null
          postgres_cdc_default: string | null
          private_only: boolean
          suspend: boolean | null
          updated_at: string
        }
        Insert: {
          broadcast_adapter?: string | null
          external_id?: string | null
          id: string
          inserted_at: string
          jwt_jwks?: Json | null
          jwt_secret?: string | null
          max_bytes_per_second?: number
          max_channels_per_client?: number
          max_concurrent_users?: number
          max_events_per_second?: number
          max_joins_per_second?: number
          max_payload_size_in_kb?: number | null
          max_presence_events_per_second?: number | null
          migrations_ran?: number | null
          name?: string | null
          notify_private_alpha?: boolean | null
          postgres_cdc_default?: string | null
          private_only?: boolean
          suspend?: boolean | null
          updated_at: string
        }
        Update: {
          broadcast_adapter?: string | null
          external_id?: string | null
          id?: string
          inserted_at?: string
          jwt_jwks?: Json | null
          jwt_secret?: string | null
          max_bytes_per_second?: number
          max_channels_per_client?: number
          max_concurrent_users?: number
          max_events_per_second?: number
          max_joins_per_second?: number
          max_payload_size_in_kb?: number | null
          max_presence_events_per_second?: number | null
          migrations_ran?: number | null
          name?: string | null
          notify_private_alpha?: boolean | null
          postgres_cdc_default?: string | null
          private_only?: boolean
          suspend?: boolean | null
          updated_at?: string
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
  _sandbox_compute: {
    Tables: {
      sbx_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          deleted_at: string | null
          enabled: boolean
          id: number
          scope: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: string
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          scope?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      sbx_sandboxes: {
        Row: {
          allow_public_traffic: boolean
          auto_pause: boolean
          cluster: string | null
          cr_name: string | null
          create_params: Json | null
          created_at: string
          created_by_role: string
          deleted_at: string | null
          envd_secure: boolean
          envd_version: string
          fail_reason: string | null
          id: number
          injected_at: string | null
          injected_env_config: Json | null
          killed_at: string | null
          last_active_at: string | null
          metadata: Json
          metered_until: string | null
          namespace: string
          network: string
          owner_user_id: string
          paused_at: string | null
          pod_name: string | null
          ready_at: string | null
          resumed_at: string | null
          sandbox_id: string
          sandbox_id_upstream: string | null
          snapshot_ref: string | null
          snapshot_size_gb: number | null
          spec_cpu_m: number
          spec_disk_mb: number
          spec_mem_mb: number
          spec_tier: string
          status: string
          template_name: string
          template_ref: string | null
          timeout_at: string | null
          updated_at: string
          upstream_access_tokens: Json | null
        }
        Insert: {
          allow_public_traffic?: boolean
          auto_pause?: boolean
          cluster?: string | null
          cr_name?: string | null
          create_params?: Json | null
          created_at?: string
          created_by_role: string
          deleted_at?: string | null
          envd_secure?: boolean
          envd_version?: string
          fail_reason?: string | null
          id?: number
          injected_at?: string | null
          injected_env_config?: Json | null
          killed_at?: string | null
          last_active_at?: string | null
          metadata?: Json
          metered_until?: string | null
          namespace: string
          network?: string
          owner_user_id: string
          paused_at?: string | null
          pod_name?: string | null
          ready_at?: string | null
          resumed_at?: string | null
          sandbox_id: string
          sandbox_id_upstream?: string | null
          snapshot_ref?: string | null
          snapshot_size_gb?: number | null
          spec_cpu_m: number
          spec_disk_mb?: number
          spec_mem_mb: number
          spec_tier: string
          status?: string
          template_name: string
          template_ref?: string | null
          timeout_at?: string | null
          updated_at?: string
          upstream_access_tokens?: Json | null
        }
        Update: {
          allow_public_traffic?: boolean
          auto_pause?: boolean
          cluster?: string | null
          cr_name?: string | null
          create_params?: Json | null
          created_at?: string
          created_by_role?: string
          deleted_at?: string | null
          envd_secure?: boolean
          envd_version?: string
          fail_reason?: string | null
          id?: number
          injected_at?: string | null
          injected_env_config?: Json | null
          killed_at?: string | null
          last_active_at?: string | null
          metadata?: Json
          metered_until?: string | null
          namespace?: string
          network?: string
          owner_user_id?: string
          paused_at?: string | null
          pod_name?: string | null
          ready_at?: string | null
          resumed_at?: string | null
          sandbox_id?: string
          sandbox_id_upstream?: string | null
          snapshot_ref?: string | null
          snapshot_size_gb?: number | null
          spec_cpu_m?: number
          spec_disk_mb?: number
          spec_mem_mb?: number
          spec_tier?: string
          status?: string
          template_name?: string
          template_ref?: string | null
          timeout_at?: string | null
          updated_at?: string
          upstream_access_tokens?: Json | null
        }
        Relationships: []
      }
      sbx_usage_minutely: {
        Row: {
          created_at: string
          id: number
          metrics: Json
          minute_bucket: string
          reported_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          metrics?: Json
          minute_bucket: string
          reported_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          metrics?: Json
          minute_bucket?: string
          reported_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sbx_usage_records: {
        Row: {
          aggregated_at: string | null
          created_at: string
          event_id: string
          id: number
          items: Json
          occurred_at: string
          owner_user_id: string
          sandbox_id: string
          vci_spec_tier: string
        }
        Insert: {
          aggregated_at?: string | null
          created_at?: string
          event_id: string
          id?: number
          items?: Json
          occurred_at: string
          owner_user_id: string
          sandbox_id: string
          vci_spec_tier?: string
        }
        Update: {
          aggregated_at?: string | null
          created_at?: string
          event_id?: string
          id?: number
          items?: Json
          occurred_at?: string
          owner_user_id?: string
          sandbox_id?: string
          vci_spec_tier?: string
        }
        Relationships: []
      }
      sbx_user_quota: {
        Row: {
          created_at: string
          deleted_at: string | null
          enabled: boolean
          id: number
          limit_value: number
          metric: string
          period: string
          period_start_at: string
          updated_at: string
          use_default_limit: boolean
          used_value_all: number
          used_value_period: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          limit_value?: number
          metric?: string
          period?: string
          period_start_at?: string
          updated_at?: string
          use_default_limit?: boolean
          used_value_all?: number
          used_value_period?: number
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: number
          limit_value?: number
          metric?: string
          period?: string
          period_start_at?: string
          updated_at?: string
          use_default_limit?: boolean
          used_value_all?: number
          used_value_period?: number
          user_id?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          applied_at: string
          version: number
        }
        Insert: {
          applied_at?: string
          version: number
        }
        Update: {
          applied_at?: string
          version?: number
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
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      configurations: {
        Row: {
          business_id: string | null
          business_type: string | null
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          business_type?: string | null
          created_at?: string | null
          data: Json
          id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          business_type?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_oauth_providers: {
        Row: {
          acceptable_client_ids: string[]
          attribute_mapping: Json
          authorization_params: Json
          authorization_url: string | null
          cached_discovery: Json | null
          client_id: string
          client_secret: string
          created_at: string
          custom_claims_allowlist: string[]
          discovery_cached_at: string | null
          discovery_url: string | null
          email_optional: boolean
          enabled: boolean
          id: string
          identifier: string
          issuer: string | null
          jwks_uri: string | null
          name: string
          pkce_enabled: boolean
          provider_type: string
          scopes: string[]
          skip_nonce_check: boolean
          token_url: string | null
          updated_at: string
          userinfo_url: string | null
        }
        Insert: {
          acceptable_client_ids?: string[]
          attribute_mapping?: Json
          authorization_params?: Json
          authorization_url?: string | null
          cached_discovery?: Json | null
          client_id: string
          client_secret: string
          created_at?: string
          custom_claims_allowlist?: string[]
          discovery_cached_at?: string | null
          discovery_url?: string | null
          email_optional?: boolean
          enabled?: boolean
          id?: string
          identifier: string
          issuer?: string | null
          jwks_uri?: string | null
          name: string
          pkce_enabled?: boolean
          provider_type: string
          scopes?: string[]
          skip_nonce_check?: boolean
          token_url?: string | null
          updated_at?: string
          userinfo_url?: string | null
        }
        Update: {
          acceptable_client_ids?: string[]
          attribute_mapping?: Json
          authorization_params?: Json
          authorization_url?: string | null
          cached_discovery?: Json | null
          client_id?: string
          client_secret?: string
          created_at?: string
          custom_claims_allowlist?: string[]
          discovery_cached_at?: string | null
          discovery_url?: string | null
          email_optional?: boolean
          enabled?: boolean
          id?: string
          identifier?: string
          issuer?: string | null
          jwks_uri?: string | null
          name?: string
          pkce_enabled?: boolean
          provider_type?: string
          scopes?: string[]
          skip_nonce_check?: boolean
          token_url?: string | null
          updated_at?: string
          userinfo_url?: string | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string | null
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string | null
          email_optional: boolean
          id: string
          invite_token: string | null
          linking_target_id: string | null
          oauth_client_state_id: string | null
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          referrer: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code?: string | null
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string | null
          email_optional?: boolean
          id: string
          invite_token?: string | null
          linking_target_id?: string | null
          oauth_client_state_id?: string | null
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string | null
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string | null
          email_optional?: boolean
          id?: string
          invite_token?: string | null
          linking_target_id?: string | null
          oauth_client_state_id?: string | null
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          last_webauthn_challenge_data: Json | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          approved_at: string | null
          authorization_code: string | null
          authorization_id: string
          client_id: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string
          expires_at: string
          id: string
          nonce: string | null
          redirect_uri: string
          resource: string | null
          response_type: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state: string | null
          status: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id: string
          client_id: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id: string
          nonce?: string | null
          redirect_uri: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id?: string
          client_id?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id?: string
          nonce?: string | null
          redirect_uri?: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope?: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_client_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Insert: {
          code_verifier?: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          id?: string
          provider_type?: string
        }
        Relationships: []
      }
      oauth_clients: {
        Row: {
          client_name: string | null
          client_secret_hash: string | null
          client_type: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri: string | null
          created_at: string
          deleted_at: string | null
          grant_types: string
          id: string
          logo_uri: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types: string
          id: string
          logo_uri?: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types?: string
          id?: string
          logo_uri?: string | null
          redirect_uris?: string
          registration_type?: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_consents: {
        Row: {
          client_id: string
          granted_at: string
          id: string
          revoked_at: string | null
          scopes: string
          user_id: string
        }
        Insert: {
          client_id: string
          granted_at?: string
          id: string
          revoked_at?: string | null
          scopes: string
          user_id: string
        }
        Update: {
          client_id?: string
          granted_at?: string
          id?: string
          revoked_at?: string | null
          scopes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown
          not_after: string | null
          oauth_client_id: string | null
          refresh_token_counter: number | null
          refresh_token_hmac_key: string | null
          refreshed_at: string | null
          scopes: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          expires_at: string
          id: string
          session_data: Json
          user_id: string | null
        }
        Insert: {
          challenge_type: string
          created_at?: string
          expires_at: string
          id?: string
          session_data: Json
          user_id?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          session_data?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webauthn_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      webauthn_credentials: {
        Row: {
          aaguid: string | null
          attestation_type: string
          backed_up: boolean
          backup_eligible: boolean
          created_at: string
          credential_id: string
          friendly_name: string
          id: string
          last_used_at: string | null
          public_key: string
          sign_count: number
          transports: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          aaguid?: string | null
          attestation_type?: string
          backed_up?: boolean
          backup_eligible?: boolean
          created_at?: string
          credential_id: string
          friendly_name?: string
          id?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number
          transports?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          aaguid?: string | null
          attestation_type?: string
          backed_up?: boolean
          backup_eligible?: boolean
          created_at?: string
          credential_id?: string
          friendly_name?: string
          id?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number
          transports?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webauthn_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: { Args: never; Returns: string }
      jwt: { Args: never; Returns: Json }
      role: { Args: never; Returns: string }
      uid: { Args: never; Returns: string }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      oauth_authorization_status: "pending" | "approved" | "denied" | "expired"
      oauth_client_type: "public" | "confidential"
      oauth_registration_type: "dynamic" | "manual"
      oauth_response_type: "code"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  extensions: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      pg_stat_statements: {
        Row: {
          calls: number | null
          dbid: unknown
          jit_deform_count: number | null
          jit_deform_time: number | null
          jit_emission_count: number | null
          jit_emission_time: number | null
          jit_functions: number | null
          jit_generation_time: number | null
          jit_inlining_count: number | null
          jit_inlining_time: number | null
          jit_optimization_count: number | null
          jit_optimization_time: number | null
          local_blk_read_time: number | null
          local_blk_write_time: number | null
          local_blks_dirtied: number | null
          local_blks_hit: number | null
          local_blks_read: number | null
          local_blks_written: number | null
          max_exec_time: number | null
          max_plan_time: number | null
          mean_exec_time: number | null
          mean_plan_time: number | null
          min_exec_time: number | null
          min_plan_time: number | null
          minmax_stats_since: string | null
          plans: number | null
          query: string | null
          queryid: number | null
          rows: number | null
          shared_blk_read_time: number | null
          shared_blk_write_time: number | null
          shared_blks_dirtied: number | null
          shared_blks_hit: number | null
          shared_blks_read: number | null
          shared_blks_written: number | null
          stats_since: string | null
          stddev_exec_time: number | null
          stddev_plan_time: number | null
          temp_blk_read_time: number | null
          temp_blk_write_time: number | null
          temp_blks_read: number | null
          temp_blks_written: number | null
          toplevel: boolean | null
          total_exec_time: number | null
          total_plan_time: number | null
          userid: unknown
          wal_bytes: number | null
          wal_fpi: number | null
          wal_records: number | null
        }
        Relationships: []
      }
      pg_stat_statements_info: {
        Row: {
          dealloc: number | null
          stats_reset: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      grant_pg_cron_access_proc: { Args: never; Returns: undefined }
      grant_pg_graphql_access_proc: { Args: never; Returns: undefined }
      grant_pg_repack_access_proc: { Args: never; Returns: undefined }
      grant_pgmq_access_proc: { Args: never; Returns: undefined }
      grant_supabase_vault_access_proc: { Args: never; Returns: undefined }
      pg_stat_statements: {
        Args: { showtext: boolean }
        Returns: Record<string, unknown>[]
      }
      pg_stat_statements_info: { Args: never; Returns: Record<string, unknown> }
      pg_stat_statements_reset: {
        Args: {
          dbid?: unknown
          minmax_only?: boolean
          queryid?: number
          userid?: unknown
        }
        Returns: string
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      uuid_generate_v1: { Args: never; Returns: string }
      uuid_generate_v1mc: { Args: never; Returns: string }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: { Args: never; Returns: string }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: { Args: never; Returns: string }
      uuid_ns_dns: { Args: never; Returns: string }
      uuid_ns_oid: { Args: never; Returns: string }
      uuid_ns_url: { Args: never; Returns: string }
      uuid_ns_x500: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _internal_resolve: {
        Args: {
          extensions?: Json
          operationName?: string
          query: string
          variables?: Json
        }
        Returns: Json
      }
      comment_directive: { Args: { comment_: string }; Returns: Json }
      exception: { Args: { message: string }; Returns: string }
      get_schema_version: { Args: never; Returns: number }
      resolve: {
        Args: {
          extensions?: Json
          operationName?: string
          query: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  neon: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      local_cache: {
        Row: {
          accesscount: number | null
          pageoffs: number | null
          relblocknumber: number | null
          reldatabase: unknown
          relfilenode: unknown
          relforknumber: number | null
          reltablespace: unknown
        }
        Relationships: []
      }
      neon_backend_perf_counters: {
        Row: {
          bucket_le: number | null
          metric: string | null
          pid: number | null
          procno: number | null
          value: number | null
        }
        Relationships: []
      }
      neon_lfc_stats: {
        Row: {
          lfc_key: string | null
          lfc_value: number | null
        }
        Relationships: []
      }
      neon_perf_counters: {
        Row: {
          bucket_le: number | null
          metric: string | null
          value: number | null
        }
        Relationships: []
      }
      neon_stat_file_cache: {
        Row: {
          file_cache_hit_ratio: number | null
          file_cache_hits: number | null
          file_cache_misses: number | null
          file_cache_used: number | null
          file_cache_writes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approximate_working_set_size: {
        Args: { reset: boolean }
        Returns: number
      }
      approximate_working_set_size_seconds: {
        Args: { duration?: number }
        Returns: number
      }
      backpressure_lsns: { Args: never; Returns: Record<string, unknown> }
      backpressure_throttling_time: { Args: never; Returns: number }
      get_backend_perf_counters: {
        Args: never
        Returns: Record<string, unknown>[]
      }
      get_local_cache_state: { Args: { max_chunks?: number }; Returns: string }
      get_perf_counters: { Args: never; Returns: Record<string, unknown>[] }
      get_prewarm_info: { Args: never; Returns: Record<string, unknown> }
      local_cache_pages: { Args: never; Returns: Record<string, unknown>[] }
      neon_get_lfc_stats: { Args: never; Returns: Record<string, unknown>[] }
      pg_cluster_size: { Args: never; Returns: number }
      prewarm_local_cache: {
        Args: { n_workers?: number; state: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  neon_migration: {
    Tables: {
      migration_id: {
        Row: {
          id: number
          key: number
        }
        Insert: {
          id?: number
          key: number
        }
        Update: {
          id?: number
          key?: number
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
  net: {
    Tables: {
      _http_response: {
        Row: {
          content: string | null
          content_type: string | null
          created: string
          error_msg: string | null
          headers: Json | null
          id: number | null
          status_code: number | null
          timed_out: boolean | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created?: string
          error_msg?: string | null
          headers?: Json | null
          id?: number | null
          status_code?: number | null
          timed_out?: boolean | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created?: string
          error_msg?: string | null
          headers?: Json | null
          id?: number | null
          status_code?: number | null
          timed_out?: boolean | null
        }
        Relationships: []
      }
      http_request_queue: {
        Row: {
          body: string | null
          headers: Json | null
          id: number
          method: string
          timeout_milliseconds: number
          url: string
        }
        Insert: {
          body?: string | null
          headers?: Json | null
          id?: number
          method: string
          timeout_milliseconds: number
          url: string
        }
        Update: {
          body?: string | null
          headers?: Json | null
          id?: number
          method?: string
          timeout_milliseconds?: number
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _await_response: { Args: { request_id: number }; Returns: boolean }
      _encode_url_with_params_array: {
        Args: { params_array: string[]; url: string }
        Returns: string
      }
      _http_collect_response: {
        Args: { async?: boolean; request_id: number }
        Returns: Database["net"]["CompositeTypes"]["http_response_result"]
        SetofOptions: {
          from: "*"
          to: "http_response_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _urlencode_string: { Args: { string: string }; Returns: string }
      _validate_url: { Args: { url: string }; Returns: undefined }
      check_proxy_reachable: { Args: never; Returns: boolean }
      check_worker_is_up: { Args: never; Returns: undefined }
      http_collect_response: {
        Args: { async?: boolean; request_id: number }
        Returns: Database["net"]["CompositeTypes"]["http_response_result"]
        SetofOptions: {
          from: "*"
          to: "http_response_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete: {
        Args: {
          body?: Json
          headers?: Json
          params?: Json
          timeout_milliseconds?: number
          url: string
        }
        Returns: number
      }
      http_get: {
        Args: {
          headers?: Json
          params?: Json
          timeout_milliseconds?: number
          url: string
        }
        Returns: number
      }
      http_post: {
        Args: {
          body?: Json
          headers?: Json
          params?: Json
          timeout_milliseconds?: number
          url: string
        }
        Returns: number
      }
      wait_until_running: { Args: never; Returns: undefined }
      wake: { Args: never; Returns: undefined }
      worker_restart: { Args: never; Returns: boolean }
    }
    Enums: {
      request_status: "PENDING" | "SUCCESS" | "ERROR"
    }
    CompositeTypes: {
      http_response: {
        status_code: number | null
        headers: Json | null
        body: string | null
      }
      http_response_result: {
        status: Database["net"]["Enums"]["request_status"] | null
        message: string | null
        response: Database["net"]["CompositeTypes"]["http_response"] | null
      }
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
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
  pgmq: {
    Tables: {
      meta: {
        Row: {
          created_at: string
          is_partitioned: boolean
          is_unlogged: boolean
          queue_name: string
        }
        Insert: {
          created_at?: string
          is_partitioned: boolean
          is_unlogged: boolean
          queue_name: string
        }
        Update: {
          created_at?: string
          is_partitioned?: boolean
          is_unlogged?: boolean
          queue_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _belongs_to_pgmq: { Args: { table_name: string }; Returns: boolean }
      _ensure_pg_partman_installed: { Args: never; Returns: undefined }
      _extension_exists: { Args: { extension_name: string }; Returns: boolean }
      _get_partition_col: {
        Args: { partition_interval: string }
        Returns: string
      }
      _get_pg_partman_major_version: { Args: never; Returns: number }
      _get_pg_partman_schema: { Args: never; Returns: string }
      acquire_queue_lock: { Args: { queue_name: string }; Returns: undefined }
      archive:
        | { Args: { msg_id: number; queue_name: string }; Returns: boolean }
        | { Args: { msg_ids: number[]; queue_name: string }; Returns: number[] }
      convert_archive_partitioned: {
        Args: {
          leading_partition?: number
          partition_interval?: string
          retention_interval?: string
          table_name: string
        }
        Returns: undefined
      }
      create: { Args: { queue_name: string }; Returns: undefined }
      create_non_partitioned: {
        Args: { queue_name: string }
        Returns: undefined
      }
      create_partitioned: {
        Args: {
          partition_interval?: string
          queue_name: string
          retention_interval?: string
        }
        Returns: undefined
      }
      create_unlogged: { Args: { queue_name: string }; Returns: undefined }
      delete:
        | { Args: { msg_id: number; queue_name: string }; Returns: boolean }
        | { Args: { msg_ids: number[]; queue_name: string }; Returns: number[] }
      detach_archive: { Args: { queue_name: string }; Returns: undefined }
      disable_notify_insert: {
        Args: { queue_name: string }
        Returns: undefined
      }
      drop_queue:
        | { Args: { queue_name: string }; Returns: boolean }
        | {
            Args: { partitioned: boolean; queue_name: string }
            Returns: boolean
          }
      enable_notify_insert: { Args: { queue_name: string }; Returns: undefined }
      format_table_name: {
        Args: { prefix: string; queue_name: string }
        Returns: string
      }
      list_queues: {
        Args: never
        Returns: Database["pgmq"]["CompositeTypes"]["queue_record"][]
        SetofOptions: {
          from: "*"
          to: "queue_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      metrics: {
        Args: { queue_name: string }
        Returns: Database["pgmq"]["CompositeTypes"]["metrics_result"]
        SetofOptions: {
          from: "*"
          to: "metrics_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      metrics_all: {
        Args: never
        Returns: Database["pgmq"]["CompositeTypes"]["metrics_result"][]
        SetofOptions: {
          from: "*"
          to: "metrics_result"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      pop: {
        Args: { qty?: number; queue_name: string }
        Returns: Database["pgmq"]["CompositeTypes"]["message_record"][]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      purge_queue: { Args: { queue_name: string }; Returns: number }
      read: {
        Args: {
          conditional?: Json
          qty: number
          queue_name: string
          vt: number
        }
        Returns: Database["pgmq"]["CompositeTypes"]["message_record"][]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      read_with_poll: {
        Args: {
          conditional?: Json
          max_poll_seconds?: number
          poll_interval_ms?: number
          qty: number
          queue_name: string
          vt: number
        }
        Returns: Database["pgmq"]["CompositeTypes"]["message_record"][]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      send:
        | {
            Args: {
              delay: string
              headers: Json
              msg: Json
              queue_name: string
            }
            Returns: number[]
          }
        | {
            Args: { delay: string; msg: Json; queue_name: string }
            Returns: number[]
          }
        | { Args: { msg: Json; queue_name: string }; Returns: number[] }
        | {
            Args: { delay: number; msg: Json; queue_name: string }
            Returns: number[]
          }
        | {
            Args: { headers: Json; msg: Json; queue_name: string }
            Returns: number[]
          }
        | {
            Args: {
              delay: number
              headers: Json
              msg: Json
              queue_name: string
            }
            Returns: number[]
          }
      send_batch:
        | {
            Args: {
              delay: string
              headers: Json[]
              msgs: Json[]
              queue_name: string
            }
            Returns: number[]
          }
        | {
            Args: { delay: string; msgs: Json[]; queue_name: string }
            Returns: number[]
          }
        | { Args: { msgs: Json[]; queue_name: string }; Returns: number[] }
        | {
            Args: { delay: number; msgs: Json[]; queue_name: string }
            Returns: number[]
          }
        | {
            Args: { headers: Json[]; msgs: Json[]; queue_name: string }
            Returns: number[]
          }
        | {
            Args: {
              delay: number
              headers: Json[]
              msgs: Json[]
              queue_name: string
            }
            Returns: number[]
          }
      set_vt: {
        Args: { msg_id: number; queue_name: string; vt: number }
        Returns: Database["pgmq"]["CompositeTypes"]["message_record"][]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      validate_queue_name: { Args: { queue_name: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      message_record: {
        msg_id: number | null
        read_ct: number | null
        enqueued_at: string | null
        vt: string | null
        message: Json | null
        headers: Json | null
      }
      metrics_result: {
        queue_name: string | null
        queue_length: number | null
        newest_msg_age_sec: number | null
        oldest_msg_age_sec: number | null
        total_messages: number | null
        scrape_time: string | null
        queue_visible_length: number | null
      }
      queue_record: {
        queue_name: string | null
        is_partitioned: boolean | null
        is_unlogged: boolean | null
        created_at: string | null
      }
    }
  }
  postgrest: {
    Tables: {
      data_api_config: {
        Row: {
          business_id: string
          business_type: string
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          business_type: string
          created_at?: string | null
          data: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          business_type?: string
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reload_config: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      health_check: {
        Row: {
          id: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          updated_at?: string | null
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
  rds_ccl: {
    Tables: {
      rules: {
        Row: {
          action: string
          burst: number | null
          ccl_id: number
          comment: string
          created_at: string
          enabled: boolean
          keywords: string[] | null
          limit_type: string
          match_type: string
          max_concurrency: number | null
          max_wait_ms: number
          max_waiting: number | null
          node_type: string
          qps: number | null
          query_id: number | null
          query_string: string | null
          search_path: string
          updated_at: string
        }
        Insert: {
          action: string
          burst?: number | null
          ccl_id: number
          comment?: string
          created_at?: string
          enabled?: boolean
          keywords?: string[] | null
          limit_type: string
          match_type: string
          max_concurrency?: number | null
          max_wait_ms?: number
          max_waiting?: number | null
          node_type?: string
          qps?: number | null
          query_id?: number | null
          query_string?: string | null
          search_path?: string
          updated_at?: string
        }
        Update: {
          action?: string
          burst?: number | null
          ccl_id?: number
          comment?: string
          created_at?: string
          enabled?: boolean
          keywords?: string[] | null
          limit_type?: string
          match_type?: string
          max_concurrency?: number | null
          max_wait_ms?: number
          max_waiting?: number | null
          node_type?: string
          qps?: number | null
          query_id?: number | null
          query_string?: string | null
          search_path?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      rules_view: {
        Row: {
          action: string | null
          burst: number | null
          ccl_id: number | null
          comment: string | null
          created_at: string | null
          enabled: boolean | null
          keywords: string[] | null
          limit_type: string | null
          match_type: string | null
          max_concurrency: number | null
          max_wait_ms: number | null
          max_waiting: number | null
          node_type: string | null
          qps: number | null
          query_id: number | null
          query_string: string | null
          search_path: string | null
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          burst?: number | null
          ccl_id?: number | null
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          keywords?: string[] | null
          limit_type?: string | null
          match_type?: string | null
          max_concurrency?: number | null
          max_wait_ms?: number | null
          max_waiting?: number | null
          node_type?: string | null
          qps?: number | null
          query_id?: number | null
          query_string?: string | null
          search_path?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          burst?: number | null
          ccl_id?: number | null
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          keywords?: string[] | null
          limit_type?: string | null
          match_type?: string | null
          max_concurrency?: number | null
          max_wait_ms?: number | null
          max_waiting?: number | null
          node_type?: string | null
          qps?: number | null
          query_id?: number | null
          query_string?: string | null
          search_path?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_ccl_rule: {
        Args: {
          action: string
          ccl_id: number
          comment?: string
          enabled?: boolean
          limit_config: Json
          match: Json
          node_type: string
          search_path?: string
        }
        Returns: number
      }
      delete_ccl_rule: { Args: { ccl_id: number }; Returns: boolean }
      disable_ccl_rule: { Args: { ccl_id: number }; Returns: boolean }
      enable_ccl_rule: { Args: { ccl_id: number }; Returns: boolean }
      get_query_id: {
        Args: { query_string: string; search_path?: string }
        Returns: number
      }
      load_ccl_rule: { Args: { ccl_id: number }; Returns: boolean }
      load_ccl_rules: { Args: never; Returns: boolean }
      reset_ccl_stats: { Args: { ccl_id?: number }; Returns: boolean }
      reset_node_stats: { Args: never; Returns: boolean }
      show_ccl_status: {
        Args: never
        Returns: {
          action: string
          active_count: number
          burst: number
          ccl_id: number
          db_oid: unknown
          generation: number
          limit_type: string
          loaded: boolean
          match_type: string
          max_concurrency: number
          max_wait_ms: number
          max_waiting: number
          node_type: string
          qps: number
          query_id: number
          tokens: number
          tombstone: boolean
          total_allowed: number
          total_matched: number
          total_queued: number
          total_rejected: number
          total_wait_ms: number
          total_wait_timeout: number
          waiting_count: number
        }[]
      }
      show_node_status: {
        Args: never
        Returns: {
          active_count: number
          configured: boolean
          enabled: boolean
          max_concurrency: number
          max_cu: number
          total_allowed: number
          total_matched: number
          total_rejected: number
        }[]
      }
      unload_ccl_rule: { Args: { ccl_id: number }; Returns: boolean }
      unload_ccl_rules: { Args: never; Returns: boolean }
      update_ccl_rule: {
        Args: { ccl_id: number; limit_config: Json }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  realtime: {
    Tables: {
      messages: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_11_17: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_11_18: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_11_19: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_11_20: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_11_21: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      subscription: {
        Row: {
          claims: Json
          claims_role: unknown
          created_at: string
          entity: unknown
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id: number
          subscription_id: string
        }
        Insert: {
          claims: Json
          claims_role?: unknown
          created_at?: string
          entity: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          subscription_id: string
        }
        Update: {
          claims?: Json
          claims_role?: unknown
          created_at?: string
          entity?: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          subscription_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_rls: {
        Args: { max_record_bytes?: number; wal: Json }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
        SetofOptions: {
          from: "*"
          to: "wal_rls"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      broadcast_changes: {
        Args: {
          event_name: string
          level?: string
          new: Record<string, unknown>
          old: Record<string, unknown>
          operation: string
          table_name: string
          table_schema: string
          topic_name: string
        }
        Returns: undefined
      }
      build_prepared_statement_sql: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          entity: unknown
          prepared_statement_name: string
        }
        Returns: string
      }
      cast: { Args: { type_: unknown; val: string }; Returns: Json }
      check_equality_op: {
        Args: {
          op: Database["realtime"]["Enums"]["equality_op"]
          type_: unknown
          val_1: string
          val_2: string
        }
        Returns: boolean
      }
      is_visible_through_filters: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
        }
        Returns: boolean
      }
      list_changes: {
        Args: {
          max_changes: number
          max_record_bytes: number
          publication: unknown
          slot_name: unknown
        }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
        SetofOptions: {
          from: "*"
          to: "wal_rls"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      quote_wal2json: { Args: { entity: unknown }; Returns: string }
      send: {
        Args: { event: string; payload: Json; private?: boolean; topic: string }
        Returns: undefined
      }
      to_regrole: { Args: { role_name: string }; Returns: unknown }
      topic: { Args: never; Returns: string }
    }
    Enums: {
      action: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE" | "ERROR"
      equality_op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in"
    }
    CompositeTypes: {
      user_defined_filter: {
        column_name: string | null
        op: Database["realtime"]["Enums"]["equality_op"] | null
        value: string | null
      }
      wal_column: {
        name: string | null
        type_name: string | null
        type_oid: unknown
        value: Json | null
        is_pkey: boolean | null
        is_selectable: boolean | null
      }
      wal_rls: {
        wal: Json | null
        is_rls_enabled: boolean | null
        subscription_ids: string[] | null
        errors: string[] | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cdn_tasks: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          next_attempt_at: string | null
          object_key: string
          task_attempts: number
          task_id: string | null
          task_status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          next_attempt_at?: string | null
          object_key: string
          task_attempts?: number
          task_id?: string | null
          task_status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          next_attempt_at?: string | null
          object_key?: string
          task_attempts?: number
          task_id?: string | null
          task_status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      configurations: {
        Row: {
          business_id: string | null
          business_type: string | null
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          business_type?: string | null
          created_at?: string | null
          data: Json
          id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          business_type?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_tables: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: []
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: []
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: []
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  supabase_functions: {
    Tables: {
      hooks: {
        Row: {
          created_at: string
          hook_name: string
          hook_table_id: number
          id: number
          request_id: number | null
        }
        Insert: {
          created_at?: string
          hook_name: string
          hook_table_id: number
          id?: number
          request_id?: number | null
        }
        Update: {
          created_at?: string
          hook_name?: string
          hook_table_id?: number
          id?: number
          request_id?: number | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          inserted_at: string
          version: string
        }
        Insert: {
          inserted_at?: string
          version: string
        }
        Update: {
          inserted_at?: string
          version?: string
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
  supabase_migrations: {
    Tables: {
      schema_migrations: {
        Row: {
          execution_time: number | null
          id: number
          name: string
          run_at: string | null
          success: boolean | null
          version: string
        }
        Insert: {
          execution_time?: number | null
          id?: number
          name: string
          run_at?: string | null
          success?: boolean | null
          version: string
        }
        Update: {
          execution_time?: number | null
          id?: number
          name?: string
          run_at?: string | null
          success?: boolean | null
          version?: string
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
  vault: {
    Tables: {
      secrets: {
        Row: {
          created_at: string
          description: string
          id: string
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      decrypted_secrets: {
        Row: {
          created_at: string | null
          decrypted_secret: string | null
          description: string | null
          id: string | null
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _crypto_aead_det_decrypt: {
        Args: {
          additional: string
          context?: string
          key_id: number
          message: string
          nonce?: string
        }
        Returns: string
      }
      _crypto_aead_det_encrypt: {
        Args: {
          additional: string
          context?: string
          key_id: number
          message: string
          nonce?: string
        }
        Returns: string
      }
      _crypto_aead_det_noncegen: { Args: never; Returns: string }
      create_secret: {
        Args: {
          new_description?: string
          new_key_id?: string
          new_name?: string
          new_secret: string
        }
        Returns: string
      }
      update_secret: {
        Args: {
          new_description?: string
          new_key_id?: string
          new_name?: string
          new_secret?: string
          secret_id: string
        }
        Returns: undefined
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
  _agent: {
    Enums: {},
  },
  _ai_gateway: {
    Enums: {},
  },
  _edge_function: {
    Enums: {},
  },
  _realtime: {
    Enums: {},
  },
  _sandbox_compute: {
    Enums: {},
  },
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      oauth_authorization_status: ["pending", "approved", "denied", "expired"],
      oauth_client_type: ["public", "confidential"],
      oauth_registration_type: ["dynamic", "manual"],
      oauth_response_type: ["code"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  extensions: {
    Enums: {},
  },
  graphql: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  neon: {
    Enums: {},
  },
  neon_migration: {
    Enums: {},
  },
  net: {
    Enums: {
      request_status: ["PENDING", "SUCCESS", "ERROR"],
    },
  },
  pgbouncer: {
    Enums: {},
  },
  pgmq: {
    Enums: {},
  },
  postgrest: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  rds_ccl: {
    Enums: {},
  },
  realtime: {
    Enums: {
      action: ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"],
      equality_op: ["eq", "neq", "lt", "lte", "gt", "gte", "in"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
  supabase_functions: {
    Enums: {},
  },
  supabase_migrations: {
    Enums: {},
  },
  vault: {
    Enums: {},
  },
} as const
