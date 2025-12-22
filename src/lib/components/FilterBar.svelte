<script lang="ts">
	import { activeFilter, setFilter } from '$lib/stores/cats';
	import type { FilterStatus } from '$lib/stores/cats';

	const filters: { value: FilterStatus; label: string }[] = [
		{ value: 'semua', label: 'Semua Kocheng' },
		{ value: 'sehat', label: 'Sehat' },
		{ value: 'sakit', label: 'Sakit' },
		{ value: 'butuh-perhatian', label: 'Butuh Perhatian' }
	];

	let isMobileMenuOpen = $state(false);

	function handleFilterClick(filter: FilterStatus) {
		setFilter(filter);
		isMobileMenuOpen = false;
	}
</script>

<!-- Desktop Filter Bar -->
<div
	class="absolute top-4 left-1/2 z-[1000] hidden max-w-fit -translate-x-1/2 items-center gap-2 rounded-full border border-orange-100 bg-white/90 p-1.5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 md:flex"
>
	{#each filters as filter}
		<button
			type="button"
			onclick={() => handleFilterClick(filter.value)}
			class="group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-bold transition-all {$activeFilter ===
			filter.value
				? 'bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white shadow-md'
				: 'text-gray-600 hover:bg-orange-50 hover:text-[#F97316]'}"
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if filter.value === 'semua'}
					🐱
				{:else if filter.value === 'sehat'}
					💚
				{:else if filter.value === 'sakit'}
					💛
				{:else}
					🚨
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
			class="animate-scale-up flex min-w-[160px] origin-bottom-right flex-col gap-2 rounded-2xl border border-white/50 bg-white/95 p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl"
		>
			<div
				class="mb-1 border-b border-orange-50 px-2 py-1 pb-2 text-center text-xs font-bold tracking-wider text-slate-400 uppercase"
			>
				Filter Peta
			</div>
			{#each filters as filter}
				<button
					type="button"
					onclick={() => handleFilterClick(filter.value)}
					class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all active:scale-95 {$activeFilter ===
					filter.value
						? 'bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white shadow-md'
						: 'bg-transparent text-slate-600 hover:bg-orange-50'}"
				>
					<span class="text-lg">
						{#if filter.value === 'semua'}
							🐱
						{:else if filter.value === 'sehat'}
							💚
						{:else if filter.value === 'sakit'}
							💛
						{:else}
							🚨
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
		class="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#F97316] text-white shadow-xl ring-2 shadow-orange-300 ring-white transition-transform hover:scale-105 active:scale-90"
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
	/* Hide scrollbar for Chrome, Safari and Opera */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	/* Hide scrollbar for IE, Edge and Firefox */
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

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
</style>
