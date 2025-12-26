<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { filteredCats, fetchCats, isLoading } from '$lib/stores/cats';

	let cats = $derived($filteredCats);
	let mapComponent: Map;
	let isLocating = $state(false);
	let locationError = $state('');

	onMount(() => {
		fetchCats();
	});

	function findNearbyCats() {
		if (!navigator.geolocation) {
			locationError = 'Browser tidak mendukung geolokasi';
			return;
		}

		isLocating = true;
		locationError = '';

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				console.log('🎯 Location obtained:', { latitude, longitude });

				// Call Map component methods directly
				if (mapComponent) {
					mapComponent.setUserMarker(latitude, longitude);
					mapComponent.flyToLocation(latitude, longitude, 16);
				}

				isLocating = false;
			},
			(error) => {
				isLocating = false;
				switch (error.code) {
					case error.PERMISSION_DENIED:
						locationError = 'Izin lokasi ditolak';
						break;
					case error.POSITION_UNAVAILABLE:
						locationError = 'Lokasi tidak tersedia';
						break;
					case error.TIMEOUT:
						locationError = 'Waktu habis';
						break;
					default:
						locationError = 'Gagal mendapatkan lokasi';
				}
				// Auto clear error after 3 seconds
				setTimeout(() => {
					locationError = '';
				}, 3000);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	}
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

		<!-- Find Nearby Cats Button -->
		<div class="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 transform">
			<button
				onclick={findNearbyCats}
				disabled={isLocating}
				class="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-4 py-3 font-bold text-slate-700 ring-2 ring-slate-100 transition-all duration-300 hover:text-[#dc419b] hover:ring-[#dc419b] disabled:cursor-wait disabled:opacity-70 sm:gap-3 sm:px-6 sm:py-3.5"
			>
				<!-- Animated Background Gradient on Hover -->
				<div
					class="absolute inset-0 bg-linear-to-r from-[#fcef04]/10 to-[#dc419b]/10 opacity-0 transition-opacity group-hover:opacity-100"
				></div>

				<!-- Icon -->
				<div
					class="relative flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#fcef04] to-[#dc419b] sm:h-10 sm:w-10"
				>
					{#if isLocating}
						<svg
							class="h-4 w-4 animate-spin text-white sm:h-5 sm:w-5"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							></path>
						</svg>
					{:else}
						<svg
							class="h-4 w-4 text-white transition-transform group-hover:scale-110 sm:h-5 sm:w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					{/if}
				</div>

				<!-- Text (Hidden on Mobile) -->
				<div class="relative hidden flex-col items-start sm:flex">
					<span class="text-sm leading-tight">
						{isLocating ? 'Mencari lokasi...' : 'Temukan Kocheng Terdekat'}
					</span>
					<span class="text-[10px] font-medium text-slate-400">
						{isLocating ? 'Mohon tunggu' : 'Gunakan lokasi Anda'}
					</span>
				</div>

				<!-- Mobile Text -->
				<span class="relative text-xs sm:hidden">
					{isLocating ? 'Mencari...' : 'Lokasi Saya'}
				</span>

				<!-- Cute Cat Emoji -->
				<span
					class="relative text-xl transition-transform group-hover:scale-110 group-hover:rotate-12 sm:text-2xl"
					>🐱</span
				>
			</button>

			<!-- Error Message -->
			{#if locationError}
				<div
					class="absolute left-1/2 mt-2 -translate-x-1/2 animate-bounce rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold whitespace-nowrap text-white"
				>
					{locationError}
				</div>
			{/if}
		</div>

		<!-- Map Container - Full Height -->
		<div class="h-full w-full">
			<Map bind:this={mapComponent} {cats} />
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
