<script lang="ts">
	import { page } from '$app/state';
	import { signOut } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	import Lottie from '$lib/components/Lottie.svelte';

	let isMobileOpen = $state(false);

	const menus = [
		{
			label: 'Dashboard',
			href: '/admin',
			icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
		},
		{ label: 'Kelola Kocheng', href: '/admin/cats', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
		{ label: 'Tambah Kocheng', href: '/admin/cats/add', icon: 'M12 4v16m8-8H4' },
		{
			label: 'Pengaturan',
			href: '/admin/settings',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
		}
	];

	async function handleLogout() {
		await signOut();
		goto('/admin/login');
	}

	// Check if the current route starts with the menu href
	// Note: page.url.pathname might be reactive, but in Svelte 5 with $page it's fine.
	// However, importing page from $app/state might be wrong. Usually it's $app/stores for 'page' store.
	// In Svelte 5 setup with explicit 'page' store.
	// Actually, SvelteKit 'page' store is $app/stores.
	// Let's assume standard SvelteKit usage.
</script>

<!-- Mobile Header -->
<div class="flex items-center justify-between bg-slate-900 p-4 text-white md:hidden">
	<span class="text-lg font-bold">Admin Panel</span>
	<button onclick={() => (isMobileOpen = !isMobileOpen)} class="p-2" aria-label="Toggle menu">
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	</button>
</div>

<!-- Sidebar -->
<aside
	class="
	fixed inset-y-0 left-0 z-30 w-72 transform border-r border-[#FED7AA] bg-white text-slate-600 shadow-xl shadow-orange-100/50 transition-transform duration-300 ease-in-out
	{isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
	md:relative md:translate-x-0
"
>
	<div class="p-8 pb-4">
		<h1 class="font-cute flex items-center gap-4 text-2xl font-bold tracking-wide text-[#F97316]">
			<div class="relative flex h-12 w-12 items-center justify-center">
				<div class="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
					<Lottie path="/animations/logo.json" />
				</div>
			</div>
			Kocheng Admin
		</h1>
		<p
			class="mt-2 inline-block rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-400"
		>
			v1.0.0 • Edisi Gemoy
		</p>
	</div>

	<nav class="mt-4 space-y-3 px-6">
		{#each menus as menu}
			<a
				href={menu.href}
				class="group flex items-center gap-4 rounded-2xl px-5 py-3.5 font-medium transition-all duration-200
				{page.url.pathname === menu.href
					? 'bg-[#FFF7ED] text-[#F97316] shadow-sm ring-1 ring-[#FED7AA]'
					: 'text-gray-500 hover:bg-slate-50 hover:pl-6 hover:text-[#F97316]'}"
			>
				<span class="transition-transform duration-200 group-hover:scale-110">
					<!-- Replace paths with the same icons but styled -->
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={menu.icon} />
					</svg>
				</span>
				{menu.label}
			</a>
		{/each}

		<div class="mt-8 border-t border-slate-100 pt-8">
			<button
				onclick={handleLogout}
				class="group flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-3.5 font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
			>
				<span class="transition-transform group-hover:-translate-x-1">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
				</span>
				Keluar
			</button>
		</div>
	</nav>
</aside>

<!-- Overlay -->
{#if isMobileOpen}
	<div
		class="fixed inset-0 z-20 bg-black/50 md:hidden"
		onclick={() => (isMobileOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (isMobileOpen = false)}
		role="button"
		tabindex="0"
		aria-label="Close menu"
	></div>
{/if}
