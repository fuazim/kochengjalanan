<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import { filteredCats, fetchCats, isLoading } from '$lib/stores/cats';

	let cats = $derived($filteredCats);

	onMount(() => {
		fetchCats();
	});
</script>

<svelte:head>
	<title>Kocheng Jalanan - Peta Kucing Jalanan</title>
	<meta
		name="description"
		content="Peta interaktif untuk melihat lokasi kucing jalanan di Indonesia"
	/>
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden bg-[#FFF7ED]">
	<!-- Header -->
	<header
		class="relative z-20 shrink-0 border-b border-orange-100 bg-white/95 text-[#F97316] shadow-sm backdrop-blur-md"
	>
		<div class="container mx-auto flex items-center justify-center px-4 py-3">
			<a href="/" class="group flex items-center gap-2 transition-transform hover:scale-105">
				<span class="animate-bounce text-3xl drop-shadow-sm filter md:text-4xl">🐱</span>
				<div>
					<h1 class="font-cute text-xl font-bold tracking-wide text-slate-800 md:text-3xl">
						Kocheng<span class="text-[#F97316]">Jalanan</span>
					</h1>
				</div>
			</a>
		</div>
	</header>

	<!-- Main Content - Map dengan Filter -->
	<main class="relative h-full w-full flex-1 overflow-hidden">
		<!-- Filter Bar (overlay di atas peta) -->
		<FilterBar />

		<!-- Map Container - Full Height -->
		<div class="h-full w-full">
			<Map {cats} center={[-6.2088, 106.8456]} zoom={13} />
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}

	:global(html) {
		height: 100%;
		overflow-x: hidden;
	}
</style>
