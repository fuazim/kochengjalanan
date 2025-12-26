import { createSupabaseClient } from '$lib/supabase';
import type { Cat, CatInsert, CatUpdate } from '$lib/types/supabase';

const supabase = createSupabaseClient();

// Security constants for file upload
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate file before upload
function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { valid: false, error: `Tipe file tidak didukung: ${file.type}` };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `Ukuran file terlalu besar (maks 5MB)` };
    }

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return { valid: false, error: `Ekstensi file tidak valid` };
    }

    return { valid: true };
}

// Upload image to Supabase Storage
export async function uploadCatImage(file: File): Promise<string | null> {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
        console.error('File validation failed:', validation.error);
        return null;
    }

    // Generate safe filename using crypto
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `cats/${fileName}`;

    const { error } = await supabase.storage.from('cat-photos').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
    });

    if (error) {
        console.error('Error uploading image:', error);
        return null;
    }

    // Get public URL
    const { data } = supabase.storage.from('cat-photos').getPublicUrl(filePath);
    return data.publicUrl;
}

// Upload multiple images
export async function uploadCatImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
        const url = await uploadCatImage(file);
        if (url) {
            urls.push(url);
        }
    }
    return urls;
}

// Delete image from storage
export async function deleteCatImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex((p) => p === 'cat-photos');
        if (bucketIndex === -1) return false;

        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        const { error } = await supabase.storage.from('cat-photos').remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error parsing image URL:', e);
        return false;
    }
}
