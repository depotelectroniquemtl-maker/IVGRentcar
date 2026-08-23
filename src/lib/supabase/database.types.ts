// Généré automatiquement depuis le projet Supabase (mcp__Supabase__generate_typescript_types).
// À régénérer après chaque migration de schéma. Ne pas éditer à la main.

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories_vehicules: {
        Row: {
          actif: boolean
          capacite_personnes: number | null
          created_at: string
          id: string
          nom: string
          type: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          capacite_personnes?: number | null
          created_at?: string
          id?: string
          nom: string
          type?: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          capacite_personnes?: number | null
          created_at?: string
          id?: string
          nom?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          adresse: string | null
          cedula: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          nationalite: string | null
          nom: string
          notes: string | null
          numero_permis: string | null
          passeport: string | null
          passeport_expiration: string | null
          permis_expiration: string | null
          residencia: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          cedula?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nationalite?: string | null
          nom: string
          notes?: string | null
          numero_permis?: string | null
          passeport?: string | null
          passeport_expiration?: string | null
          permis_expiration?: string | null
          residencia?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          cedula?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nationalite?: string | null
          nom?: string
          notes?: string | null
          numero_permis?: string | null
          passeport?: string | null
          passeport_expiration?: string | null
          permis_expiration?: string | null
          residencia?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contrats_location: {
        Row: {
          abono_usd: number | null
          accessoires: Json
          couleur_vehicule: string | null
          created_at: string
          created_by: string | null
          deducible_usd: number | null
          garant_adresse: string | null
          garant_cedula: string | null
          garant_nom: string | null
          garant_telephone: string | null
          heure_remise: string | null
          id: string
          niveau_essence: string | null
          notes: string | null
          reservation_id: string
          solde_usd: number | null
          updated_at: string
        }
        Insert: {
          abono_usd?: number | null
          accessoires?: Json
          couleur_vehicule?: string | null
          created_at?: string
          created_by?: string | null
          deducible_usd?: number | null
          garant_adresse?: string | null
          garant_cedula?: string | null
          garant_nom?: string | null
          garant_telephone?: string | null
          heure_remise?: string | null
          id?: string
          niveau_essence?: string | null
          notes?: string | null
          reservation_id: string
          solde_usd?: number | null
          updated_at?: string
        }
        Update: {
          abono_usd?: number | null
          accessoires?: Json
          couleur_vehicule?: string | null
          created_at?: string
          created_by?: string | null
          deducible_usd?: number | null
          garant_adresse?: string | null
          garant_cedula?: string | null
          garant_nom?: string | null
          garant_telephone?: string | null
          heure_remise?: string | null
          id?: string
          niveau_essence?: string | null
          notes?: string | null
          reservation_id?: string
          solde_usd?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contrats_location_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrats_location_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrats_location_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations_avec_phase"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_reservation: {
        Row: {
          created_at: string
          date_debut: string
          date_fin: string
          email: string | null
          heure_debut: string | null
          heure_fin: string | null
          id: string
          lieu_prise_en_charge: string | null
          nom: string
          notes: string | null
          prix_estime_usd: number | null
          statut: string
          updated_at: string
          vehicule_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          date_debut: string
          date_fin: string
          email?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          lieu_prise_en_charge?: string | null
          nom: string
          notes?: string | null
          prix_estime_usd?: number | null
          statut?: string
          updated_at?: string
          vehicule_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          date_debut?: string
          date_fin?: string
          email?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          lieu_prise_en_charge?: string | null
          nom?: string
          notes?: string | null
          prix_estime_usd?: number | null
          statut?: string
          updated_at?: string
          vehicule_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandes_reservation_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_reservation_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules_disponibilite"
            referencedColumns: ["id"]
          },
        ]
      }
      entretiens: {
        Row: {
          cout_usd: number | null
          created_at: string
          created_by: string | null
          date_entretien: string
          id: string
          notes: string | null
          prochain_entretien: string | null
          type: string
          updated_at: string
          vehicule_id: string
        }
        Insert: {
          cout_usd?: number | null
          created_at?: string
          created_by?: string | null
          date_entretien?: string
          id?: string
          notes?: string | null
          prochain_entretien?: string | null
          type?: string
          updated_at?: string
          vehicule_id: string
        }
        Update: {
          cout_usd?: number | null
          created_at?: string
          created_by?: string | null
          date_entretien?: string
          id?: string
          notes?: string | null
          prochain_entretien?: string | null
          type?: string
          updated_at?: string
          vehicule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entretiens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entretiens_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entretiens_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules_disponibilite"
            referencedColumns: ["id"]
          },
        ]
      }
      indisponibilites_vehicule: {
        Row: {
          created_at: string
          created_by: string | null
          date_debut: string
          date_fin: string
          id: string
          motif: string | null
          updated_at: string
          vehicule_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_debut: string
          date_fin: string
          id?: string
          motif?: string | null
          updated_at?: string
          vehicule_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_debut?: string
          date_fin?: string
          id?: string
          motif?: string | null
          updated_at?: string
          vehicule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "indisponibilites_vehicule_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indisponibilites_vehicule_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indisponibilites_vehicule_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules_disponibilite"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nom: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nom: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          caution_usd: number | null
          client_id: string
          created_at: string
          created_by: string | null
          date_debut: string
          date_fin: string
          heure_debut: string | null
          heure_fin: string | null
          id: string
          lieu_prise_en_charge: string | null
          notes: string | null
          numero: number
          prix_total_usd: number | null
          statut: string
          updated_at: string
          vehicule_id: string
        }
        Insert: {
          caution_usd?: number | null
          client_id: string
          created_at?: string
          created_by?: string | null
          date_debut: string
          date_fin: string
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          lieu_prise_en_charge?: string | null
          notes?: string | null
          numero?: number
          prix_total_usd?: number | null
          statut?: string
          updated_at?: string
          vehicule_id: string
        }
        Update: {
          caution_usd?: number | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          date_debut?: string
          date_fin?: string
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          lieu_prise_en_charge?: string | null
          notes?: string | null
          numero?: number
          prix_total_usd?: number | null
          statut?: string
          updated_at?: string
          vehicule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules_disponibilite"
            referencedColumns: ["id"]
          },
        ]
      }
      tarifs: {
        Row: {
          categorie_id: string
          created_at: string
          id: string
          palier: string
          prix_usd: number
          updated_at: string
        }
        Insert: {
          categorie_id: string
          created_at?: string
          id?: string
          palier: string
          prix_usd: number
          updated_at?: string
        }
        Update: {
          categorie_id?: string
          created_at?: string
          id?: string
          palier?: string
          prix_usd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarifs_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicules: {
        Row: {
          actif: boolean
          annee: number | null
          categorie_id: string
          couleur: string | null
          created_at: string
          etat_operationnel: string
          id: string
          notes: string | null
          photo_url: string | null
          plaque: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          annee?: number | null
          categorie_id: string
          couleur?: string | null
          created_at?: string
          etat_operationnel?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          plaque?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          annee?: number | null
          categorie_id?: string
          couleur?: string | null
          created_at?: string
          etat_operationnel?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          plaque?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicules_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      reservations_avec_phase: {
        Row: {
          caution_usd: number | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date_debut: string | null
          date_fin: string | null
          id: string | null
          notes: string | null
          phase: string | null
          prix_total_usd: number | null
          statut: string | null
          updated_at: string | null
          vehicule_id: string | null
        }
        Insert: {
          caution_usd?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string | null
          notes?: string | null
          phase?: never
          prix_total_usd?: number | null
          statut?: string | null
          updated_at?: string | null
          vehicule_id?: string | null
        }
        Update: {
          caution_usd?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string | null
          notes?: string | null
          phase?: never
          prix_total_usd?: number | null
          statut?: string | null
          updated_at?: string | null
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules_disponibilite"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicules_disponibilite: {
        Row: {
          actif: boolean | null
          annee: number | null
          categorie_id: string | null
          categorie_nom: string | null
          created_at: string | null
          etat_operationnel: string | null
          id: string | null
          loue_aujourd_hui: boolean | null
          notes: string | null
          photo_url: string | null
          plaque: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicules_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculer_prix_total: {
        Args: {
          p_categorie_id: string
          p_date_debut: string
          p_date_fin: string
        }
        Returns: number
      }
      categories_avec_flotte_active: {
        Args: never
        Returns: {
          categorie_id: string
        }[]
      }
      disponibilite_categorie: {
        Args: {
          p_categorie_id: string
          p_date_debut: string
          p_date_fin: string
        }
        Returns: boolean
      }
      disponibilite_vehicule: {
        Args: {
          p_date_debut: string
          p_date_fin: string
          p_vehicule_id: string
        }
        Returns: boolean
      }
      est_admin: { Args: never; Returns: boolean }
      est_staff: { Args: never; Returns: boolean }
      periodes_indisponibles_vehicule: {
        Args: { p_vehicule_id: string }
        Returns: {
          date_debut: string
          date_fin: string
          source: string
        }[]
      }
      vehicules_publics_par_categorie: {
        Args: { p_categorie_id: string }
        Returns: {
          annee: number
          categorie_id: string
          id: string
          photo_url: string
        }[]
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
