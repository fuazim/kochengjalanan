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

	onMount(async () => {
		const leafletModule = await import('leaflet');
		L = leafletModule.default;

		map = L.map(mapContainer, {
			center,
			zoom,
			zoomControl: true
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

	// React to flyToTrigger changes (for "Find Nearby" feature - forces flyTo every click)
	$effect(() => {
		// Log at the very start to see if effect runs
		console.log('🔄 flyTo effect triggered:', { map: !!map, L: !!L, flyToTrigger, center, zoom });

		if (!map || !L) return;

		// Explicitly access all reactive variables to track them
		const trigger = flyToTrigger;
		const [lat, lng] = center;
		const currentZoom = zoom;

		if (trigger > 0) {
			console.log('🗺️ Map flying to:', { lat, lng, zoom: currentZoom });
			map.flyTo([lat, lng], currentZoom, { animate: true, duration: 1.5 });
		}
	});

	// Update user location marker
	$effect(() => {
		// Log at the very start to see if effect runs
		console.log('🔄 userMarker effect triggered:', { map: !!map, L: !!L, userLocation });
		if (!map || !L) return;

		// Explicitly access userLocation to track it
		const currentUserLocation = userLocation;

		// Remove existing user marker
		if (userMarker) {
			map.removeLayer(userMarker);
			userMarker = null;
		}

		// Add new user marker if location exists
		if (currentUserLocation) {
			const [lat, lng] = currentUserLocation;

			// Create custom user location icon with inline styles and ping effect like cat markers
			const userIconHtml = `
				<div style="position: relative; width: 28px; height: 28px;">
					<div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #3b82f6; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
					<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
						<div style="width: 20px; height: 20px; border-radius: 9999px; border: 3px solid white; background-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center;">
							<div style="width: 6px; height: 6px; border-radius: 9999px; background-color: white;"></div>
						</div>
					</div>
				</div>
			`;

			const userIcon = L.divIcon({
				html: userIconHtml,
				className: 'user-location-marker',
				iconSize: [28, 28],
				iconAnchor: [14, 14]
			});

			userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
			console.log('📍 User marker added at:', { lat, lng });
			if (userMarker) {
				userMarker.bindPopup(
					'<div class="font-bold text-blue-600 text-sm px-2 py-1">📍 Lokasi Anda</div>',
					{
						className: 'user-popup'
					}
				);
			}
		}
	});
</script>

<div bind:this={mapContainer} class="h-full w-full"></div>

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
	:global(.user-location-marker) {
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
