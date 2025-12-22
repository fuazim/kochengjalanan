import { writable, derived } from 'svelte/store';
import { createSupabaseClient } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Supabase client
const supabase = createSupabaseClient();

// Auth stores
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const isLoading = writable<boolean>(true);
export const authError = writable<string | null>(null);

// Derived store for auth state
export const isAuthenticated = derived(user, ($user) => !!$user);

// Initialize auth state
export async function initAuth(): Promise<void> {
    isLoading.set(true);

    try {
        // Get current session
        const {
            data: { session: currentSession }
        } = await supabase.auth.getSession();

        if (currentSession) {
            session.set(currentSession);
            user.set(currentSession.user);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, newSession) => {
            session.set(newSession);
            user.set(newSession?.user ?? null);
        });
    } catch (e: any) {
        console.error('Error initializing auth:', e);
        authError.set(e.message);
    } finally {
        isLoading.set(false);
    }
}

// Sign in with email/password
export async function signIn(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    authError.set(null);
    isLoading.set(true);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            authError.set(error.message);
            return { success: false, error: error.message };
        }

        if (data.session) {
            session.set(data.session);
            user.set(data.user);
        }

        return { success: true };
    } catch (e: any) {
        console.error('Error signing in:', e);
        authError.set(e.message);
        return { success: false, error: e.message };
    } finally {
        isLoading.set(false);
    }
}

// Sign out
export async function signOut(): Promise<void> {
    isLoading.set(true);

    try {
        await supabase.auth.signOut();
        session.set(null);
        user.set(null);
    } catch (e: any) {
        console.error('Error signing out:', e);
        authError.set(e.message);
    } finally {
        isLoading.set(false);
    }
}

// Kept for backward compatibility
export const auth = {
    subscribe: user.subscribe,
    login: signIn,
    logout: signOut
};
