<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type { Map, Marker } from 'leaflet';

	let { latitude = $bindable(0), longitude = $bindable(0) } = $props();

	let mapContainer: HTMLDivElement;
	let map: Map | null = null;
	let marker: Marker | null = null;
	let L: any;

	onMount(async () => {
		const leafletModule = await import('leaflet');
		L = leafletModule.default;

		// Default to Jakarta if no coords
		const defaultCenter: [number, number] =
			latitude && longitude ? [latitude, longitude] : [-6.2088, 106.8456];

		map = L.map(mapContainer, {
			center: defaultCenter,
			zoom: 13
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
			maxZoom: 19
		}).addTo(map!);

		if (latitude && longitude) {
			updateMarker(latitude, longitude);
		}

		if (map) {
			map.on('click', (e: any) => {
				const { lat, lng } = e.latlng;
				latitude = lat;
				longitude = lng;
				updateMarker(lat, lng);
			});
		}
	});

	function updateMarker(lat: number, lng: number) {
		if (!L || !map) return;

		if (marker) {
			marker.setLatLng([lat, lng]);
		} else {
			marker = L.marker([lat, lng], { draggable: true }).addTo(map);
			if (marker) {
				marker.on('dragend', (e: any) => {
					const pos = e.target.getLatLng();
					latitude = pos.lat;
					longitude = pos.lng;
				});
			}
		}
	}

	$effect(() => {
		if (map && latitude && longitude) {
			// If props change from outside (e.g. geolocation), update marker
			// But careful not to loop if we just updated it ourselves
			// For now, assume one-way sync mainly or simple reactivity
		}
	});

	function handleUseMyLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				updateMarker(latitude, longitude);
				map?.setView([latitude, longitude], 15);
			});
		}
	}
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<span class="block text-sm font-medium text-gray-700">Pilih Lokasi</span>
		<button
			type="button"
			onclick={handleUseMyLocation}
			class="flex items-center gap-1 text-sm text-[#F97316] hover:underline"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			Gunakan Lokasi Saya
		</button>
	</div>

	<div
		bind:this={mapContainer}
		class="relative z-0 h-[300px] w-full rounded-lg border border-slate-300"
	></div>

	{#if latitude && longitude}
		<div class="rounded bg-slate-50 p-2 font-mono text-xs text-slate-500">
			Lat: {latitude.toFixed(8)}, Long: {longitude.toFixed(8)}
		</div>
	{:else}
		<div class="text-xs text-slate-500 italic">Klik peta untuk menandai lokasi.</div>
	{/if}
</div>
