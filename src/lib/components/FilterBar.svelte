<script lang="ts">
	import { activeFilter, setFilter } from '$lib/stores/cats';
	import type { FilterStatus } from '$lib/stores/cats';
	import CatIcon from './CatIcon.svelte';
	import CatIconAll from './CatIconAll.svelte';

	const filters: { value: FilterStatus; label: string; color: string }[] = [
		{ value: 'semua', label: 'Semua Kocheng', color: '#fcef04' },
		{ value: 'sehat', label: 'Sehat', color: '#10b981' },
		{ value: 'sakit', label: 'Sakit', color: '#f59e0b' },
		{ value: 'butuh-perhatian', label: 'Butuh Perhatian', color: '#ef4444' }
	];

	let isMobileMenuOpen = $state(false);

	function handleFilterClick(filter: FilterStatus) {
		setFilter(filter);
		isMobileMenuOpen = false;
	}

	function getFilterColor(filterValue: FilterStatus): string {
		const filter = filters.find((f) => f.value === filterValue);
		return filter?.color || '#fcef04';
	}
</script>

<!-- Desktop Filter Bar -->
<div
	class="absolute top-4 left-1/2 z-[1000] hidden max-w-fit -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 p-1.5 backdrop-blur-md transition-all duration-300 hover:scale-105 md:flex"
>
	{#each filters as filter}
		<button
			type="button"
			onclick={() => handleFilterClick(filter.value)}
			class="group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-bold transition-all {$activeFilter ===
			filter.value
				? 'bg-linear-to-r from-[#fcef04] to-[#dc419b] text-white'
				: 'text-gray-600 hover:bg-pink-50 hover:text-[#dc419b]'}"
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if filter.value === 'semua'}
					<span class="icon-semua-kocheng">
						<CatIconAll
							color={$activeFilter === filter.value ? '#ffffff' : filter.color}
							size={18}
						/>
					</span>
				{:else}
					<CatIcon color={$activeFilter === filter.value ? '#ffffff' : filter.color} size={18} />
				{/if}
				{filter.label}
			</span>
		</button>
	{/each}
</div>

<!-- Mobile Filter FAB & Menu -->
<div class="fixed right-6 bottom-6 z-[1000] flex flex-col items-end gap-3 md:hidden">
	<!-- Overlay Menu -->
	{#if isMobileMenuOpen}
		<div
			class="animate-scale-up flex min-w-[160px] origin-bottom-right flex-col gap-2 rounded-2xl bg-white/95 p-2 backdrop-blur-xl"
		>
			<div
				class="mb-1 px-2 py-1 pb-2 text-center text-xs font-bold tracking-wider text-slate-400 uppercase"
			>
				Filter Peta
			</div>
			{#each filters as filter}
				<button
					type="button"
					onclick={() => handleFilterClick(filter.value)}
					class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all active:scale-95 {$activeFilter ===
					filter.value
						? 'bg-linear-to-r from-[#fcef04] to-[#dc419b] text-white'
						: 'bg-transparent text-slate-600 hover:bg-pink-50'}"
				>
					<span class="text-lg">
						{#if filter.value === 'semua'}
							<span class="icon-semua-kocheng-mobile">
								<CatIconAll
									color={$activeFilter === filter.value ? '#ffffff' : filter.color}
									size={20}
								/>
							</span>
						{:else}
							<CatIcon
								color={$activeFilter === filter.value ? '#ffffff' : filter.color}
								size={20}
							/>
						{/if}
					</span>
					<span>{filter.label}</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- FAB Button -->
	<button
		onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
		class="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-[#fcef04] to-[#dc419b] text-white transition-transform hover:scale-105 active:scale-90"
	>
		{#if isMobileMenuOpen}
			<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		{:else}
			<!-- Filter Icon -->
			<svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
				/>
			</svg>
		{/if}
	</button>
</div>

<style>
	@keyframes scale-up {
		0% {
			opacity: 0;
			transform: scale(0.8) translateY(10px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.animate-scale-up {
		animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	/* Icon Semua Kocheng lebih besar tanpa mempengaruhi container */
	:global(.icon-semua-kocheng) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transform: scale(1.3);
		transform-origin: center;
	}

	:global(.icon-semua-kocheng-mobile) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transform: scale(1.3);
		transform-origin: center;
	}
</style>
