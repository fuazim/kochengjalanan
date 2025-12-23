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

		const locationLabel = cat.location_name || 'Lokasi tidak diketahui';
		const shortLocation =
			locationLabel.length > 60 ? `${locationLabel.slice(0, 57)}...` : locationLabel;
		const locationTitle = locationLabel.replace(/"/g, '&quot;');

		// Create CUTE popup HTML content
		const imageUrl = cat.thumbnail_url || cat.photos?.[0] || '';
		const imageHtml = imageUrl
			? `<div class="relative h-44 overflow-hidden rounded-t-3xl">
				<img src="${imageUrl}" alt="${cat.name}" class="h-full w-full object-cover" />
				<div class="absolute inset-x-0 bottom-3 px-3">
					<span class="inline-flex max-w-full items-center truncate rounded-full border border-white/60 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur" title="${locationTitle}">
						${shortLocation}
					</span>
				</div>
			   </div>`
			: `<div class="flex h-44 items-center justify-center rounded-t-3xl bg-slate-50 text-sm font-semibold text-slate-400">No photo</div>`;

		const descriptionHtml = cat.description
			? `<p class="text-sm text-slate-600 line-clamp-2 leading-relaxed">${cat.description}</p>`
			: '';

		const infoItems = [];
		if (cat.gender && cat.gender !== 'unknown') {
			infoItems.push(`<span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
				${cat.gender === 'jantan' ? 'Jantan' : 'Betina'}
			</span>`);
		}
		if (cat.age_estimate) {
			const ageLabel =
				cat.age_estimate === 'kitten'
					? 'Kitten'
					: cat.age_estimate === 'dewasa'
						? 'Dewasa'
						: 'Senior';
			infoItems.push(
				`<span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">${ageLabel}</span>`
			);
		}

		const infoHtml =
			infoItems.length > 0
				? `<div class="flex flex-wrap gap-2 mt-2">${infoItems.join('')}</div>`
				: '';

		const popupHtml = `
			<div class="font-sans w-[280px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
				${imageHtml}
				<div class="space-y-3 bg-white p-5">
					<div class="space-y-2">
						<h3 class="font-cute text-xl font-bold text-slate-800">${cat.name}</h3>
						<span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getHealthStatusColor(cat.health_status)}">
							${getHealthStatusLabel(cat.health_status)}
						</span>
					</div>
					${descriptionHtml}
					${infoHtml}
					<div class="pt-3">
						<a href="/cats/${cat.id}" class="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#fcef04] to-[#dc419b] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
							<span>Lihat Detailnya</span>
							<span class="transition-transform group-hover:translate-x-1">-&gt;</span>
						</a>
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
