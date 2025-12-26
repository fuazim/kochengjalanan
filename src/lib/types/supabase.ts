export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            cats: {
                Row: {
                    id: string;
                    name: string;
                    slug: string | null;
                    description: string | null;
                    latitude: number;
                    longitude: number;
                    location_name: string | null;
                    location_landmark: string | null;
                    photos: string[] | null;
                    thumbnail_url: string | null;
                    health_status: 'sehat' | 'sakit' | 'kritis';
                    health_notes: string | null;
                    gender: 'jantan' | 'betina' | 'unknown' | null;
                    color: string | null;
                    age_estimate: 'kitten' | 'dewasa' | 'senior' | null;
                    is_neutered: boolean;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    latitude: number;
                    longitude: number;
                    location_name?: string | null;
                    location_landmark?: string | null;
                    photos?: string[] | null;
                    thumbnail_url?: string | null;
                    health_status?: 'sehat' | 'sakit' | 'kritis';
                    health_notes?: string | null;
                    gender?: 'jantan' | 'betina' | 'unknown' | null;
                    color?: string | null;
                    age_estimate?: 'kitten' | 'dewasa' | 'senior' | null;
                    is_neutered?: boolean;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    latitude?: number;
                    longitude?: number;
                    location_name?: string | null;
                    location_landmark?: string | null;
                    photos?: string[] | null;
                    thumbnail_url?: string | null;
                    health_status?: 'sehat' | 'sakit' | 'kritis';
                    health_notes?: string | null;
                    gender?: 'jantan' | 'betina' | 'unknown' | null;
                    color?: string | null;
                    age_estimate?: 'kitten' | 'dewasa' | 'senior' | null;
                    is_neutered?: boolean;
                    is_active?: boolean;
                    updated_at?: string;
                };
                Relationships: [];
            };
            cat_activity_logs: {
                Row: {
                    id: string;
                    cat_id: string;
                    activity_type: 'feeding' | 'health_check' | 'grooming' | 'other';
                    notes: string | null;
                    user_name: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    cat_id: string;
                    activity_type: 'feeding' | 'health_check' | 'grooming' | 'other';
                    notes?: string | null;
                    user_name?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    cat_id?: string;
                    activity_type?: 'feeding' | 'health_check' | 'grooming' | 'other';
                    notes?: string | null;
                    user_name?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'cat_activity_logs_cat_id_fkey';
                        columns: ['cat_id'];
                        referencedRelation: 'cats';
                        referencedColumns: ['id'];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

export type Cat = Database['public']['Tables']['cats']['Row'];
export type CatInsert = Database['public']['Tables']['cats']['Insert'];
export type CatUpdate = Database['public']['Tables']['cats']['Update'];

export type ActivityLog = Database['public']['Tables']['cat_activity_logs']['Row'];
export type ActivityLogInsert = Database['public']['Tables']['cat_activity_logs']['Insert'];
export type ActivityLogUpdate = Database['public']['Tables']['cat_activity_logs']['Update'];
