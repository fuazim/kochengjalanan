<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getCatById } from '$lib/stores/cats';
	import type { Cat } from '$lib/types/supabase';

	let cat = $state<Cat | null>(null);
	let isLoading = $state(true);
	let errorMessage = $state('');

	function getStatusLabel(status: Cat['health_status']): string {
		const labels: Record<Cat['health_status'], string> = {
			sehat: 'Sehat Walafiat',
			sakit: 'Lagi Sakit',
			kritis: 'Butuh Pertolongan'
		};
		return labels[status];
	}

	function getStatusClass(status: Cat['health_status']): string {
		const classes: Record<Cat['health_status'], string> = {
			sehat: 'border-green-200 bg-green-100 text-green-700',
			sakit: 'border-yellow-200 bg-yellow-100 text-yellow-700',
			kritis: 'border-red-200 bg-red-100 text-red-700'
		};
		return classes[status];
	}

	function getGenderLabel(gender: Cat['gender']): string {
		if (gender === 'jantan') return 'Jantan';
		if (gender === 'betina') return 'Betina';
		return 'Tidak diketahui';
	}

	function getAgeLabel(age: Cat['age_estimate']): string {
		if (age === 'kitten') return 'Kitten';
		if (age === 'dewasa') return 'Dewasa';
		if (age === 'senior') return 'Senior';
		return 'Tidak diketahui';
	}

	function formatValue(value: string | null | undefined): string {
		return value && value.trim().length > 0 ? value : '-';
	}

	onMount(async () => {
		const id = page.params.id;
		if (!id) {
			errorMessage = 'Kocheng tidak ditemukan.';
			isLoading = false;
			return;
		}

		const data = await getCatById(id);
		if (!data) {
			errorMessage = 'Kocheng tidak ditemukan.';
		} else {
			cat = data;
		}
		isLoading = false;
	});
</script>

<svelte:head>
	<title>Detail Kocheng</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<div class="mx-auto max-w-md space-y-8 px-4 py-8">
		<div class="flex flex-wrap items-center gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#fcef04] to-[#dc419b] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
			>
				Kembali ke Peta
			</a>
			{#if cat}
				<a
					href={`https://www.google.com/maps?q=${cat.latitude},${cat.longitude}`}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
				>
					Buka di Google Maps
				</a>
			{/if}
		</div>

		{#if isLoading}
			<div class="rounded-3xl border border-slate-100 bg-white p-8 text-center text-slate-500">
				Memuat detail kocheng...
			</div>
		{:else if errorMessage}
			<div class="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
				{errorMessage}
			</div>
		{:else if cat}
			<div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]">
				<div class="space-y-8">
					<div class="space-y-4">
						<div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
							{#if cat.thumbnail_url}
								<img
									src={cat.thumbnail_url}
									alt={cat.name}
									class="h-52 w-full object-cover"
								/>
							{:else}
								<div class="flex h-52 items-center justify-center text-sm font-semibold text-slate-400">
									Tidak ada foto
								</div>
							{/if}
						</div>

						{#if cat.photos && cat.photos.length > 1}
							<div class="grid grid-cols-3 gap-3">
								{#each cat.photos as photo}
									<img
										src={photo}
										alt={cat.name}
										class="h-16 w-full rounded-2xl border border-slate-100 object-cover"
									/>
								{/each}
							</div>
						{/if}
					</div>

					<div class="space-y-6">
						<div class="space-y-3">
							<h1 class="font-cute text-2xl font-bold text-slate-800">{cat.name}</h1>
							<div class="flex flex-wrap gap-2">
								<span
									class={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
										cat.health_status
									)}`}
								>
									{getStatusLabel(cat.health_status)}
								</span>
								<span
									class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
								>
									{getGenderLabel(cat.gender)}
								</span>
								<span
									class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
								>
									{getAgeLabel(cat.age_estimate)}
								</span>
								<span
									class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
								>
									{cat.is_neutered ? 'Sudah Steril' : 'Belum Steril'}
								</span>
							</div>
						</div>

						<div class="rounded-2xl border border-slate-100 bg-slate-50 p-5">
							<h2 class="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Deskripsi
							</h2>
							<p class="mt-2 text-sm text-slate-600">
								{formatValue(cat.description)}
							</p>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<div class="rounded-2xl border border-slate-100 bg-white p-5">
								<p class="text-xs font-semibold uppercase text-slate-400">Warna Bulu</p>
								<p class="mt-1 text-sm font-semibold text-slate-700">{formatValue(cat.color)}</p>
							</div>
							<div class="rounded-2xl border border-slate-100 bg-white p-5">
								<p class="text-xs font-semibold uppercase text-slate-400">Catatan Kesehatan</p>
								<p class="mt-1 text-sm text-slate-600">{formatValue(cat.health_notes)}</p>
							</div>
						</div>

						<div class="rounded-2xl border border-slate-100 bg-white p-5">
							<p class="text-xs font-semibold uppercase text-slate-400">Lokasi</p>
							<p class="mt-2 text-sm font-semibold text-slate-700">
								{formatValue(cat.location_name)}
							</p>
							<p class="mt-1 text-xs text-slate-500">
								Patokan: {formatValue(cat.location_landmark)}
							</p>
							<p class="mt-3 text-xs text-slate-400">
								Koordinat: {cat.latitude.toFixed(6)}, {cat.longitude.toFixed(6)}
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
