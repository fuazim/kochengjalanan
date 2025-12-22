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
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

export type Cat = Database['public']['Tables']['cats']['Row'];
export type CatInsert = Database['public']['Tables']['cats']['Insert'];
export type CatUpdate = Database['public']['Tables']['cats']['Update'];
