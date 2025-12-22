import { createSupabaseClient } from '$lib/supabase';
import type { Cat, CatInsert, CatUpdate } from '$lib/types/supabase';

const supabase = createSupabaseClient();

// Upload image to Supabase Storage
export async function uploadCatImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
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
