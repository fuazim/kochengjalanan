<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type { Map, Marker } from 'leaflet';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerShadow from 'leaflet/dist/images/marker-shadow.png';
	import { MapPin } from 'lucide-svelte';

	let { latitude = $bindable(0), longitude = $bindable(0) } = $props();

	let mapContainer: HTMLDivElement;
	let map: Map | null = null;
	let marker: Marker | null = null;
	let L: any;
	let isMapReady = $state(false);

	// Track previous coordinates to detect external changes
	let prevLatitude = latitude;
	let prevLongitude = longitude;

	onMount(async () => {
		const leafletModule = await import('leaflet');
		L = leafletModule.default;
		delete (L.Icon.Default.prototype as any)._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: markerIcon2x,
			iconUrl: markerIcon,
			shadowUrl: markerShadow
		});

		// Default to Jakarta if no coords
		const defaultCenter: [number, number] =
			latitude && longitude ? [latitude, longitude] : [-6.2088, 106.8456];

		map = L.map(mapContainer, {
			center: defaultCenter,
			zoom: 13,
			zoomControl: true,
			attributionControl: false
		});

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(map!);

		if (latitude && longitude) {
			updateMarker(latitude, longitude);
		}

		if (map) {
			map.on('click', (e: any) => {
				const { lat, lng } = e.latlng;
				latitude = lat;
				longitude = lng;
				prevLatitude = lat;
				prevLongitude = lng;
				updateMarker(lat, lng);
			});
		}

		isMapReady = true;
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
					prevLatitude = pos.lat;
					prevLongitude = pos.lng;
				});
			}
		}
	}

	function syncMapToLocation(lat: number, lng: number) {
		if (!map || !L) return;
		updateMarker(lat, lng);
		map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
	}

	// React to external coordinate changes (e.g., from location search)
	$effect(() => {
		// Only run when map is ready and coordinates have actually changed
		if (!isMapReady) return;

		const hasCoords = latitude !== 0 && longitude !== 0;
		const coordsChanged = latitude !== prevLatitude || longitude !== prevLongitude;

		if (hasCoords && coordsChanged) {
			prevLatitude = latitude;
			prevLongitude = longitude;
			syncMapToLocation(latitude, longitude);
		}
	});

	function handleUseMyLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				prevLatitude = latitude;
				prevLongitude = longitude;
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
			<MapPin class="h-4 w-4" />
			Gunakan Lokasi Saya
		</button>
	</div>

	<div class="relative z-0 h-[300px] w-full overflow-hidden rounded-2xl border-2 border-slate-100">
		<div bind:this={mapContainer} class="h-full w-full"></div>
		<!-- Custom Cute Attribution -->
		<div
			class="absolute right-2 bottom-2 z-[400] rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-sm"
		>
			🗺️ <a href="https://openstreetmap.org" target="_blank" class="hover:underline">OSM</a>
		</div>
	</div>

	{#if latitude && longitude}
		<div class="rounded bg-slate-50 p-2 font-mono text-xs text-slate-500">
			Lat: {latitude.toFixed(8)}, Long: {longitude.toFixed(8)}
		</div>
	{:else}
		<div class="text-xs text-slate-500 italic">Klik peta untuk menandai lokasi.</div>
	{/if}
</div>

<style>
	:global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
		gap: 8px;
		display: flex;
		flex-direction: column;
	}

	:global(.leaflet-control-zoom a) {
		background-image: linear-gradient(135deg, #fcef04, #dc419b) !important;
		color: #ffffff !important;
		border-radius: 9999px !important;
		width: 40px !important;
		height: 40px !important;
		line-height: 40px !important;
		font-weight: bold !important;
		font-size: 18px !important;
		border: none !important;
		transition: all 0.2s;
	}

	:global(.leaflet-control-zoom a:hover) {
		filter: brightness(1.05);
		transform: scale(1.1);
	}

	:global(.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar) {
		border: none !important;
	}
</style>
