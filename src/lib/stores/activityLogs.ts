import { createSupabaseClient } from '$lib/supabase';
import type { ActivityLog, ActivityLogInsert } from '$lib/types/supabase';

// Fetch activity logs for a specific cat
export async function fetchActivityLogs(catId: string): Promise<ActivityLog[]> {
    const supabase = createSupabaseClient();

    try {
        const { data, error } = await supabase
            .from('cat_activity_logs')
            .select('*')
            .eq('cat_id', catId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (e: any) {
        console.error('Error fetching activity logs:', e);
        return [];
    }
}

// Extended type with cat info for dashboard
export interface ActivityLogWithCat extends ActivityLog {
    cat?: {
        id: string;
        name: string;
        slug: string | null;
        thumbnail_url: string | null;
    };
}

// Fetch all activity logs (for admin dashboard)
export async function fetchAllActivityLogs(limit: number = 10): Promise<ActivityLogWithCat[]> {
    const supabase = createSupabaseClient();

    try {
        const { data, error } = await supabase
            .from('cat_activity_logs')
            .select(`
                *,
                cat:cats(id, name, slug, thumbnail_url)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (e: any) {
        console.error('Error fetching all activity logs:', e);
        return [];
    }
}

// Security constants
const MAX_NOTES_LENGTH = 500;
const MAX_USERNAME_LENGTH = 50;

// Add a new activity log
export async function addActivityLog(log: ActivityLogInsert): Promise<ActivityLog | null> {
    const supabase = createSupabaseClient();

    try {
        // Validate and sanitize input
        const sanitizedLog: ActivityLogInsert = {
            ...log,
            // Trim and limit notes length
            notes: log.notes ? log.notes.trim().slice(0, MAX_NOTES_LENGTH) : null,
            // Trim and limit user_name length, default to 'Anonim'
            user_name: log.user_name
                ? log.user_name.trim().slice(0, MAX_USERNAME_LENGTH) || 'Anonim'
                : 'Anonim'
        };

        const { data, error } = await supabase
            .from('cat_activity_logs')
            .insert(sanitizedLog)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (e: any) {
        console.error('Error adding activity log:', e);
        return null;
    }
}

// Get activity type label in Indonesian
export function getActivityTypeLabel(type: ActivityLog['activity_type']): string {
    const labels: Record<ActivityLog['activity_type'], string> = {
        feeding: 'Memberi Makan',
        health_check: 'Cek Kesehatan',
        grooming: 'Grooming',
        other: 'Lainnya'
    };
    return labels[type];
}

// Get activity type icon
export function getActivityTypeIcon(type: ActivityLog['activity_type']): string {
    const icons: Record<ActivityLog['activity_type'], string> = {
        feeding: '🍽️',
        health_check: '💊',
        grooming: '✂️',
        other: '📝'
    };
    return icons[type];
}

// Format relative time in Indonesian
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Baru saja';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} menit yang lalu`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} jam yang lalu`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} hari yang lalu`;
    }

    // Format as date for older entries
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
