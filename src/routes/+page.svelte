<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
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

<div class="flex h-screen flex-col overflow-x-hidden overflow-y-visible bg-white">
	<!-- Header -->
	<div class="overflow-visible">
		<Navbar />
	</div>

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
		overflow-y: visible;
	}

	:global(html) {
		height: 100%;
		overflow-x: hidden;
		overflow-y: visible;
	}
	
	:global(header) {
		overflow: visible !important;
	}
</style>
