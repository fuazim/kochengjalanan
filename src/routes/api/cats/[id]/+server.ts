import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import type { CatUpdate } from '$lib/types/supabase';

// DELETE - Soft delete a cat (set is_active to false)
export const DELETE: RequestHandler = async ({ params }) => {
    const { id } = params;

    if (!id) {
        throw error(400, 'Cat ID is required');
    }

    const supabase = createAdminClient();

    const updateData: CatUpdate = {
        is_active: false,
        updated_at: new Date().toISOString()
    };

    const { error: deleteError } = await supabase
        .from('cats')
        .update(updateData)
        .eq('id', id);

    if (deleteError) {
        console.error('Error deleting cat:', deleteError);
        throw error(500, deleteError.message);
    }

    return json({ success: true, message: 'Cat deleted successfully' });
};

// PATCH - Update a cat
export const PATCH: RequestHandler = async ({ params, request }) => {
    const { id } = params;

    if (!id) {
        throw error(400, 'Cat ID is required');
    }

    const updates = await request.json() as CatUpdate;
    const supabase = createAdminClient();

    const updateData: CatUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
    };

    const { data, error: updateError } = await supabase
        .from('cats')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating cat:', updateError);
        throw error(500, updateError.message);
    }

    return json({ success: true, data });
};
