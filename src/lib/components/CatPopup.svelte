<script lang="ts">
	import type { Cat as CatType } from '$lib/types/supabase';
	import { Cat } from 'lucide-svelte';

	interface Props {
		cat: CatType;
	}

	let { cat }: Props = $props();

	function getStatusLabel(status: string) {
		const map: Record<string, string> = {
			sehat: 'Sehat',
			sakit: 'Sakit',
			kritis: 'Butuh Perhatian'
		};
		return map[status] || status;
	}

	function getStatusClass(status: string) {
		const map: Record<string, string> = {
			sehat: 'bg-green-50 text-green-600 ring-green-100',
			sakit: 'bg-yellow-50 text-yellow-600 ring-yellow-100',
			kritis: 'bg-red-50 text-red-600 ring-red-100'
		};
		return map[status] || 'bg-slate-50 text-slate-600 ring-slate-100';
	}

	function getGenderLabel(gender: string | null) {
		if (!gender) return '';
		if (gender === 'jantan') return 'Jantan';
		if (gender === 'betina') return 'Betina';
		return '';
	}

	function getAgeLabel(age: string | null) {
		if (!age) return '';
		if (age === 'kitten') return 'Kitten';
		if (age === 'dewasa') return 'Dewasa';
		if (age === 'senior') return 'Senior';
		return '';
	}
</script>

<div class="w-72 overflow-hidden rounded-2xl bg-white text-left font-sans ring-1 ring-slate-100">
	<!-- Image Header -->
	<div class="relative h-40 w-full overflow-hidden bg-slate-100">
		{#if cat.thumbnail_url || cat.photos?.[0]}
			<img
				src={cat.thumbnail_url || (cat.photos ? cat.photos[0] : '')}
				alt={cat.name}
				class="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-slate-300">
				<Cat class="h-16 w-16" />
			</div>
		{/if}

		<!-- Status Badge -->
		<div class="absolute top-3 right-3">
			<span
				class={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase shadow-sm ring-1 backdrop-blur-md ${getStatusClass(
					cat.health_status
				)}`}
			>
				{getStatusLabel(cat.health_status)}
			</span>
		</div>
	</div>

	<!-- Content Body -->
	<div class="p-4">
		<!-- Title -->
		<div class="mb-2">
			<h3 class="text-lg leading-tight font-bold text-slate-800">{cat.name}</h3>
		</div>

		<!-- Tags -->
		<div class="mb-4 flex flex-wrap gap-1.5">
			{#if getGenderLabel(cat.gender)}
				<span
					class="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100"
				>
					{getGenderLabel(cat.gender)}
				</span>
			{/if}
			{#if getAgeLabel(cat.age_estimate)}
				<span
					class="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100"
				>
					{getAgeLabel(cat.age_estimate)}
				</span>
			{/if}
			<!-- Steril Tag -->
			<span
				class={`rounded-md px-2 py-1 text-[10px] font-bold ring-1 ${cat.is_neutered ? 'bg-blue-50 text-blue-600 ring-blue-100' : 'bg-slate-50 text-slate-400 ring-slate-100'}`}
			>
				{cat.is_neutered ? 'Sudah Steril' : 'Belum Steril'}
			</span>
		</div>

		<!-- Location (Fixed Overflow) -->
		<div class="mb-4 flex items-start gap-2 rounded-lg bg-orange-50/50 p-2.5">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="mt-0.5 size-3.5 shrink-0 text-orange-400"
			>
				<path
					fill-rule="evenodd"
					d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
					clip-rule="evenodd"
				/>
			</svg>
			<div class="min-w-0 flex-1">
				<p class="mb-0.5 text-xs font-bold text-slate-700">Lokasi Terkini</p>
				<p class="line-clamp-2 text-xs leading-relaxed text-slate-500" title={cat.location_name}>
					{cat.location_name || 'Lokasi tidak tersedia'}
				</p>
			</div>
		</div>

		<!-- Action Button (Gradient Style) -->
		<a
			href="/cats/{cat.slug || cat.id}"
			class="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#fcef04] to-[#dc419b] py-2.5 text-xs font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
		>
			Lihat Detail
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="size-3.5 transition-transform group-hover:translate-x-1"
			>
				<path
					fill-rule="evenodd"
					d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
	</div>
</div>

<style>
	/* Override Leaflet Popup Styles for Clean UI */
	:global(.leaflet-popup-content-wrapper) {
		padding: 0 !important;
		background: transparent !important;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
		border-radius: 1rem !important;
	}
	:global(.leaflet-popup-content) {
		margin: 0 !important;
		width: auto !important;
	}
	:global(.leaflet-popup-tip) {
		background-color: white;
	}
	:global(a.leaflet-popup-close-button) {
		color: white !important;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}
	:global(a.leaflet-popup-close-button:hover) {
		color: #fcef04 !important;
	}
</style>
