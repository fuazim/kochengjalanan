<script lang="ts">
	import type { Cat } from '$lib/data/mockCats';

	interface Props {
		cat: Cat;
	}

	let { cat }: Props = $props();

	function getHealthStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			sehat: 'Sehat',
			sakit: 'Sakit',
			kritis: 'Butuh Perhatian'
		};
		return labels[status] || status;
	}

	function getHealthStatusColor(status: string): string {
		const colors: Record<string, string> = {
			sehat: 'bg-green-100 text-green-800 border-green-300',
			sakit: 'bg-yellow-100 text-yellow-800 border-yellow-300',
			kritis: 'bg-red-100 text-red-800 border-red-300'
		};
		return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
	}
</script>

<div class="cat-popup rounded-lg bg-white shadow-lg overflow-hidden max-w-xs">
	<!-- Foto Kucing -->
	{#if cat.thumbnail_url || cat.photos?.[0]}
		<img
			src={cat.thumbnail_url || cat.photos[0]}
			alt={cat.name}
			class="w-full h-48 object-cover"
		/>
	{:else}
		<div class="w-full h-48 bg-orange-100 flex items-center justify-center">
			<span class="text-6xl">🐱</span>
		</div>
	}

	<!-- Content -->
	<div class="p-4 space-y-3">
		<!-- Nama dan Status -->
		<div class="flex items-start justify-between gap-2">
			<h3 class="text-xl font-bold text-gray-900 flex-1">{cat.name}</h3>
			<span
				class="px-2 py-1 text-xs font-semibold rounded-full border {getHealthStatusColor(
					cat.health_status
				)}"
			>
				{getHealthStatusLabel(cat.health_status)}
			</span>
		</div>

		<!-- Lokasi -->
		{#if cat.location_name || cat.location_landmark}
			<div class="space-y-1">
				<p class="text-sm font-semibold text-gray-700">Lokasi</p>
				<p class="text-sm text-gray-600">
					{#if cat.location_name}
						{cat.location_name}
						{#if cat.location_landmark}
							<br />
							<span class="text-gray-500">{cat.location_landmark}</span>
						{/if}
					{:else if cat.location_landmark}
						{cat.location_landmark}
					{/if}
				</p>
			</div>
		{/if}

		<!-- Deskripsi -->
		{#if cat.description}
			<div>
				<p class="text-sm text-gray-600 line-clamp-3">{cat.description}</p>
			</div>
		{/if}

		<!-- Info Tambahan -->
		<div class="flex flex-wrap gap-2 text-xs text-gray-500">
			{#if cat.gender && cat.gender !== 'unknown'}
				<span>• {cat.gender === 'jantan' ? 'Jantan' : 'Betina'}</span>
			{/if}
			{#if cat.age_estimate}
				<span>• {cat.age_estimate === 'kitten' ? 'Kitten' : cat.age_estimate === 'dewasa' ? 'Dewasa' : 'Senior'}</span>
			{/if}
			{#if cat.is_neutered}
				<span>• Sudah Steril</span>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(.leaflet-popup-content-wrapper) {
		padding: 0;
		border-radius: 0.5rem;
	}

	:global(.leaflet-popup-content) {
		margin: 0;
		width: auto !important;
	}
</style>

