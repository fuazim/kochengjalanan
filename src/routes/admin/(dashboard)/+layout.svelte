<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { user, initAuth, isLoading as authLoading } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children } = $props();
	let isChecking = $state(true);

	onMount(() => {
		// Initialize Supabase auth
		initAuth();

		// Subscribe to user changes
		const unsubscribe = user.subscribe((currentUser) => {
			if (!$authLoading && !currentUser) {
				goto('/admin/login');
			}
			// Small delay to prevent flash
			setTimeout(() => {
				isChecking = false;
			}, 100);
		});
		return unsubscribe;
	});
</script>

{#if isChecking}
	<div class="flex min-h-screen items-center justify-center bg-white">
		<div class="flex animate-pulse flex-col items-center">
			<span class="mb-2 text-4xl">🐱</span>
			<p class="font-medium text-slate-500">Memuat...</p>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen flex-col bg-white font-sans md:flex-row">
		<Sidebar />
		<main class="h-[calc(100vh-60px)] flex-1 overflow-y-auto md:h-screen">
			<div class="mx-auto max-w-7xl p-4 md:p-8">
				{@render children()}
			</div>
		</main>
	</div>
{/if}
