import { writable, derived, get } from 'svelte/store';
import { createSupabaseClient } from '$lib/supabase';
import type { Cat, CatInsert, CatUpdate } from '$lib/types/supabase';

export type FilterStatus = 'semua' | 'sehat' | 'sakit' | 'butuh-perhatian';

// Store untuk semua kucing
export const cats = writable<Cat[]>([]);

// Store untuk loading state
export const isLoading = writable<boolean>(false);

// Store untuk error
export const error = writable<string | null>(null);

// Store untuk filter aktif
export const activeFilter = writable<FilterStatus>('semua');

// Computed store untuk kucing yang sudah difilter
export const filteredCats = derived([cats, activeFilter], ([$cats, $activeFilter]) => {
	if ($activeFilter === 'semua') {
		return $cats.filter((cat) => cat.is_active);
	}

	if ($activeFilter === 'sehat') {
		return $cats.filter((cat) => cat.is_active && cat.health_status === 'sehat');
	}

	if ($activeFilter === 'sakit') {
		return $cats.filter((cat) => cat.is_active && cat.health_status === 'sakit');
	}

	if ($activeFilter === 'butuh-perhatian') {
		return $cats.filter((cat) => cat.is_active && cat.health_status === 'kritis');
	}

	return $cats.filter((cat) => cat.is_active);
});

// Function untuk set filter
export function setFilter(filter: FilterStatus) {
	activeFilter.set(filter);
}

// Fetch all cats from Supabase
export async function fetchCats(): Promise<void> {
	const supabase = createSupabaseClient();
	isLoading.set(true);
	error.set(null);

	try {
		const { data, error: fetchError } = await supabase
			.from('cats')
			.select('*')
			.eq('is_active', true)
			.order('created_at', { ascending: false });

		if (fetchError) {
			throw fetchError;
		}

		cats.set(data || []);
	} catch (e: any) {
		console.error('Error fetching cats:', e);
		error.set(e.message || 'Failed to fetch cats');
	} finally {
		isLoading.set(false);
	}
}

// Add a new cat
export async function addCat(cat: CatInsert): Promise<Cat | null> {
	const supabase = createSupabaseClient();

	try {
		const insertData: CatInsert = cat;
		const { data, error: insertError } = await supabase
			.from('cats')
			.insert(insertData)
			.select()
			.single();

		if (insertError) {
			throw insertError;
		}

		// Update local store
		cats.update((current) => [data, ...current]);

		return data;
	} catch (e: any) {
		console.error('Error adding cat:', e);
		error.set(e.message || 'Failed to add cat');
		return null;
	}
}

// Update a cat
export async function updateCat(id: string, updates: CatUpdate): Promise<Cat | null> {
	const supabase = createSupabaseClient();

	try {
		const updateData: CatUpdate = { ...updates, updated_at: new Date().toISOString() };
		const { data, error: updateError } = await supabase
			.from('cats')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			throw updateError;
		}

		// Update local store
		cats.update((current) => current.map((cat) => (cat.id === id ? data : cat)));

		return data;
	} catch (e: any) {
		console.error('Error updating cat:', e);
		error.set(e.message || 'Failed to update cat');
		return null;
	}
}

// Delete a cat (soft delete) via API endpoint
export async function deleteCat(id: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/cats/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to delete cat');
		}

		// Update local store
		cats.update((current) => current.filter((cat) => cat.id !== id));

		return true;
	} catch (e: any) {
		console.error('Error deleting cat:', e);
		error.set(e.message || 'Failed to delete cat');
		return false;
	}
}

// Get a single cat by ID
export async function getCatById(id: string): Promise<Cat | null> {
	const supabase = createSupabaseClient();

	try {
		const { data, error: fetchError } = await supabase
			.from('cats')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError) {
			throw fetchError;
		}

		return data;
	} catch (e: any) {
		console.error('Error fetching cat:', e);
		return null;
	}
}
