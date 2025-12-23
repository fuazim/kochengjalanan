<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map, Marker } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import type { Cat } from '$lib/types/supabase';

	interface Props {
		cats: Cat[];
		center?: [number, number];
		zoom?: number;
	}

	let { cats, center = [-6.2088, 106.8456], zoom = 13 }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: Map | null = null;
	let markers: Marker[] = [];
	let L: any;

	onMount(async () => {
		// Dynamically import Leaflet
		const leafletModule = await import('leaflet');
		L = leafletModule.default;

		// Initialize map
		map = L.map(mapContainer, {
			center,
			zoom,
			zoomControl: true
		});

		// Add Minimal CartoDB tiles (Positron)
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

	function getHealthStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			sehat: 'Sehat Walafiat',
			sakit: 'Lagi Sakit',
			kritis: 'Butuh Pertolongan'
		};
		return labels[status] || status;
	}

	function getHealthStatusColor(status: string): string {
		const colors: Record<string, string> = {
			sehat: 'bg-green-100 text-green-700 border-green-200',
			sakit: 'bg-yellow-100 text-yellow-700 border-yellow-200',
			kritis: 'bg-red-100 text-red-700 border-red-200'
		};
		return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
	}

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

		// Create CUTE popup HTML content
		const imageUrl = cat.thumbnail_url || cat.photos?.[0] || '';
		const imageHtml = imageUrl
			? `<div class="relative h-48 overflow-hidden rounded-t-2xl group">
				<img src="${imageUrl}" alt="${cat.name}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
				<div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
				<div class="absolute bottom-3 left-3 text-white">
					<p class="text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30">
						📍 ${cat.location_name || 'Lokasi tidak diketahui'}
					</p>
				</div>
			   </div>`
			: `<div class="w-full h-48 bg-orange-50 flex items-center justify-center rounded-t-2xl"><span class="text-6xl animate-pulse">🐱</span></div>`;

		const descriptionHtml = cat.description
			? `<p class="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">"${cat.description}"</p>`
			: '';

		const infoItems = [];
		if (cat.gender && cat.gender !== 'unknown') {
			infoItems.push(`<span class="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">
				${cat.gender === 'jantan' ? '♂️ Jantan' : '♀️ Betina'}
			</span>`);
		}
		if (cat.age_estimate) {
			const ageLabel =
				cat.age_estimate === 'kitten'
					? '👶 Kitten'
					: cat.age_estimate === 'dewasa'
						? '🧑 Dewasa'
						: '👴 Senior';
			infoItems.push(
				`<span class="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">${ageLabel}</span>`
			);
		}

		const infoHtml =
			infoItems.length > 0
				? `<div class="flex flex-wrap gap-2 mt-2">${infoItems.join('')}</div>`
				: '';

		const popupHtml = `
			<div class="font-sans rounded-2xl bg-white shadow-xl overflow-hidden w-[280px] border-2 border-orange-100">
				${imageHtml}
				<div class="p-5 space-y-3 bg-white relative">
					<div class="absolute -top-6 right-4 rotate-3 transform hover:rotate-6 transition-transform">
						<span class="text-3xl filter drop-shadow-md">🐾</span>
					</div>
					
					<div>
						<h3 class="text-2xl font-bold text-slate-800 font-cute mb-1">${cat.name}</h3>
						<span class="inline-block px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${getHealthStatusColor(cat.health_status)}">
							${getHealthStatusLabel(cat.health_status)}
						</span>
					</div>
					
					${descriptionHtml}
					${infoHtml}

					<div class="pt-3 border-t border-slate-100 mt-2">
						<button class="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-orange-200 shadow-lg flex items-center justify-center gap-2 group">
							<span>Lihat Detailnya</span>
							<span class="group-hover:translate-x-1 transition-transform">→</span>
						</button>
					</div>
				</div>
			</div>
		`;

		marker.bindPopup(popupHtml, {
			maxWidth: 300,
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
		// Explicitly access cats to register dependency
		const currentCats = cats;
		if (map) {
			updateMarkers(currentCats);
		}
	});
</script>

<div bind:this={mapContainer} class="h-full w-full"></div>

<style>
	:global(.cat-popup-container .leaflet-popup-content-wrapper) {
		padding: 0;
		border-radius: 1rem;
		background: transparent;
		box-shadow: none;
	}

	:global(.cat-popup-container .leaflet-popup-content) {
		margin: 0;
		width: auto !important;
	}

	:global(.cat-popup-container .leaflet-popup-tip) {
		background: white;
	}

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
		background-color: white !important;
		color: #f97316 !important;
		border-radius: 9999px !important;
		width: 40px !important;
		height: 40px !important;
		line-height: 40px !important;
		font-weight: bold !important;
		font-size: 18px !important;
		border: 2px solid #ffedd5 !important;
		transition: all 0.2s;
	}

	:global(.leaflet-control-zoom a:hover) {
		background-color: #fff7ed !important;
		color: #ea580c !important;
		transform: scale(1.1);
		border-color: #fdba74 !important;
	}

	:global(.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar) {
		border: none !important;
	}
</style>
