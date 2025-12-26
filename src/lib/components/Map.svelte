<script lang="ts">
	import { onMount, onDestroy, mount } from 'svelte';
	import type { Map, Marker } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import type { Cat } from '$lib/types/supabase';
	import CatPopup from './CatPopup.svelte';

	interface Props {
		cats: Cat[];
		center?: [number, number];
		zoom?: number;
		userLocation?: [number, number] | null;
		flyToTrigger?: number;
	}

	let {
		cats,
		center = [-6.2088, 106.8456],
		zoom = 13,
		userLocation = null,
		flyToTrigger = 0
	}: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: Map | null = null;
	let markers: Marker[] = [];
	let userMarker: Marker | null = null;
	let L: any;

	// Exported function to fly to a specific location
	export function flyToLocation(lat: number, lng: number, zoomLevel: number = 16) {
		if (map && L) {
			console.log('🚀 flyToLocation called:', { lat, lng, zoomLevel });
			map.flyTo([lat, lng], zoomLevel, { animate: true, duration: 1.5 });
		}
	}

	// Exported function to set user marker
	export function setUserMarker(lat: number, lng: number) {
		if (!map || !L) return;
		console.log('📍 setUserMarker called:', { lat, lng });

		// Remove existing marker
		if (userMarker) {
			map.removeLayer(userMarker);
			userMarker = null;
		}

		// Create user marker with same style as cat marker
		const userIconHtml = `
			<div class="relative group">
				<div class="absolute -inset-1 rounded-full opacity-75 animate-ping" style="background-color: #3b82f6"></div>
				<div class="relative transform transition-transform hover:scale-110 duration-200">
					<div style="
						background-color: #3b82f6;
						border: 3px solid white;
						border-radius: 50%;
						width: 48px;
						height: 48px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 24px;
						box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
						cursor: pointer;
						position: relative;
						z-index: 10;
					" class="user-marker-icon">
						<span class="animate-bounce-slow">🧑</span>
					</div>
					<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100 transform translate-y-[-50%] z-0"></div>
				</div>
			</div>
		`;

		const userIcon = L.divIcon({
			html: userIconHtml,
			className: 'custom-user-marker',
			iconSize: [48, 48],
			iconAnchor: [24, 48],
			popupAnchor: [0, -50]
		});

		userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
		if (userMarker) {
			userMarker.bindPopup(
				'<div class="font-bold text-blue-600 text-sm px-2 py-1">📍 Lokasi Anda</div>',
				{ className: 'user-popup' }
			);
			userMarker.openPopup();
		}
	}

	onMount(async () => {
		const leafletModule = await import('leaflet');
		L = leafletModule.default;

		map = L.map(mapContainer, {
			center,
			zoom,
			zoomControl: true,
			attributionControl: false
		});

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(map);

		// Update markers when cats change
		updateMarkers(cats);
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = null;
		}
	});

	function createCatMarker(cat: Cat): Marker {
		// Determine color based on health status
		let color = '#4ADE80'; // green-400
		let ringColor = '#BBF7D0'; // green-200

		if (cat.health_status === 'sakit') {
			color = '#FACC15'; // yellow-400
			ringColor = '#FEF08A'; // yellow-200
		} else if (cat.health_status === 'kritis') {
			color = '#F87171'; // red-400
			ringColor = '#FECACA'; // red-200
		}

		// Create custome animated icon HTML
		const iconHtml = `
			<div class="relative group">
				<div class="absolute -inset-1 rounded-full opacity-75 animate-ping" style="background-color: ${color}"></div>
				<div class="relative transform transition-transform hover:scale-110 duration-200">
					<div style="
						background-color: ${color};
						border: 3px solid white;
						border-radius: 50%;
						width: 48px;
						height: 48px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 24px;
						box-shadow: 0 4px 12px rgba(0,0,0,0.15);
						cursor: pointer;
						position: relative;
						z-index: 10;
					" class="cat-marker-icon">
						<span class="animate-bounce-slow">🐱</span>
					</div>
					<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100 transform translate-y-[-50%] z-0"></div>
				</div>
			</div>
		`;

		const customIcon = L.divIcon({
			html: iconHtml,
			className: 'custom-cat-marker',
			iconSize: [48, 48],
			iconAnchor: [24, 48],
			popupAnchor: [0, -50]
		});

		const marker = L.marker([cat.latitude, cat.longitude], { icon: customIcon });

		// Use the clean CatPopup component
		const popupContainer = document.createElement('div');
		mount(CatPopup, { target: popupContainer, props: { cat } });

		marker.bindPopup(popupContainer, {
			maxWidth: 320,
			className: 'cat-popup-container',
			closeButton: false
		});

		return marker;
	}

	function updateMarkers(catList: Cat[]) {
		if (!map) return;

		// Remove existing markers
		markers.forEach((marker) => {
			map?.removeLayer(marker);
		});
		markers = [];

		// Add new markers
		catList.forEach((cat) => {
			const marker = createCatMarker(cat);
			marker.addTo(map!);
			markers.push(marker);
		});
	}

	// Update markers when cats prop changes
	$effect(() => {
		const currentCats = cats;
		if (map) {
			updateMarkers(currentCats);
		}
	});

	// React to flyToTrigger changes (for "Find Nearby" feature)
	$effect(() => {
		if (!map || !L) return;

		// Track dependencies (console.log required for Svelte 5 reactivity)
		const trigger = flyToTrigger;
		const targetCenter = center;
		const targetZoom = zoom;
		console.log('🗺️ Map effect:', { trigger, targetCenter, targetZoom });

		if (trigger > 0 && targetCenter) {
			const [lat, lng] = targetCenter;
			map.flyTo([lat, lng], targetZoom, { animate: true, duration: 1.5 });
		}
	});

	// Update user location marker and fly to it
	$effect(() => {
		if (!map || !L) return;

		// Track userLocation (console.log required for Svelte 5 reactivity)
		const currentUserLocation = userLocation;
		console.log('📍 UserLocation effect:', currentUserLocation);

		// Remove existing user marker first
		if (userMarker) {
			map.removeLayer(userMarker);
			userMarker = null;
		}

		// Add new user marker if location exists
		if (currentUserLocation) {
			const [lat, lng] = currentUserLocation;

			// Create custom user location icon with pulse animation
			const userIconHtml = `
				<div style="position: relative; width: 32px; height: 32px;">
					<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: #3b82f6; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
					<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
						<div style="width: 24px; height: 24px; border-radius: 9999px; border: 3px solid white; background-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center;">
							<div style="width: 8px; height: 8px; border-radius: 9999px; background-color: white;"></div>
						</div>
					</div>
				</div>
			`;

			const userIcon = L.divIcon({
				html: userIconHtml,
				className: 'user-location-marker',
				iconSize: [32, 32],
				iconAnchor: [16, 16]
			});

			userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

			if (userMarker) {
				userMarker.bindPopup(
					'<div class="font-bold text-blue-600 text-sm px-2 py-1">📍 Lokasi Anda</div>',
					{ className: 'user-popup' }
				);
				// Auto open popup to show user their location
				userMarker.openPopup();
			}
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="h-full w-full"></div>

	<!-- Custom Cute Attribution -->
	<div
		class="absolute right-2 bottom-2 z-[400] rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-[#dc419b]"
	>
		🗺️ Maps by <a href="https://openstreetmap.org" target="_blank" class="hover:underline">OSM</a> & Carto
	</div>
</div>

<style>
	:global(.custom-cat-marker) {
		background: transparent;
		border: none;
	}

	@keyframes bounce-slow {
		0%,
		100% {
			transform: translateY(-5%);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}

	:global(.animate-bounce-slow) {
		animation: bounce-slow 2s infinite;
	}

	/* Custom Cute Zoom Controls */
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

	/* User Location Marker */
	:global(.user-location-marker),
	:global(.custom-user-marker) {
		background: transparent !important;
		border: none !important;
	}

	@keyframes ping {
		75%,
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}
</style>
