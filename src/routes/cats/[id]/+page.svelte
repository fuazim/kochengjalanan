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

<div class="min-h-screen bg-slate-50/50">
	<div class="mx-auto max-w-5xl px-4 py-8 md:px-8">
		<!-- Header Navigation -->
		<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
			<a
				href="/"
				class="group flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-slate-50 hover:text-[#dc419b] hover:shadow-md hover:ring-[#dc419b]/20"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="h-4 w-4 transition-transform group-hover:-translate-x-1"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
				Kembali ke Peta
			</a>

			{#if cat}
				<a
					href={`https://www.google.com/maps?q=${cat.latitude},${cat.longitude}`}
					target="_blank"
					rel="noreferrer"
					class="group flex items-center gap-2 rounded-2xl bg-[#ff9f45] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#ff8a22]"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							fill-rule="evenodd"
							d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
							clip-rule="evenodd"
						/>
					</svg>
					Buka di Google Maps
				</a>
			{/if}
		</div>

		{#if isLoading}
			<div
				class="flex h-64 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-lg shadow-slate-200/50"
			>
				<div
					class="h-12 w-12 animate-spin rounded-full border-4 border-[#fcef04] border-t-[#dc419b]"
				></div>
				<p class="mt-4 font-bold text-slate-400">Sedang memanggil kocheng...</p>
			</div>
		{:else if errorMessage}
			<div class="rounded-3xl border-2 border-red-100 bg-red-50 p-8 text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl"
				>
					😿
				</div>
				<p class="font-bold text-red-600">{errorMessage}</p>
			</div>
		{:else if cat}
			<div class="grid gap-8 lg:grid-cols-12">
				<!-- Left Column: Photos -->
				<div class="space-y-4 lg:col-span-5">
					<div class="overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm ring-1 ring-slate-100">
						<div
							class="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-slate-100 sm:aspect-square lg:aspect-[4/5]"
						>
							{#if cat.thumbnail_url}
								<img
									src={cat.thumbnail_url}
									alt={cat.name}
									class="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
								/>
							{:else}
								<div class="flex h-full w-full flex-col items-center justify-center text-slate-300">
									<span class="text-6xl">🐱</span>
									<span class="mt-2 text-sm font-bold">Tidak ada foto</span>
								</div>
							{/if}

							<!-- Floating Status Badge -->
							<div class="absolute top-4 left-4">
								<span
									class={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md ${getStatusClass(
										cat.health_status
									)}`}
								>
									<span class="relative flex h-2 w-2">
										<span
											class={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
												cat.health_status === 'sehat'
													? 'bg-green-400'
													: cat.health_status === 'sakit'
														? 'bg-yellow-400'
														: 'bg-red-400'
											}`}
										></span>
										<span
											class={`relative inline-flex h-2 w-2 rounded-full ${
												cat.health_status === 'sehat'
													? 'bg-green-500'
													: cat.health_status === 'sakit'
														? 'bg-yellow-500'
														: 'bg-red-500'
											}`}
										></span>
									</span>
									{getStatusLabel(cat.health_status)}
								</span>
							</div>
						</div>
					</div>

					{#if cat.photos && cat.photos.length > 1}
						<div class="grid grid-cols-4 gap-3">
							{#each cat.photos as photo}
								<button
									class="overflow-hidden rounded-2xl bg-white p-1 shadow-md ring-1 ring-slate-100 transition-transform hover:-translate-y-1 hover:shadow-lg"
								>
									<img
										src={photo}
										alt={cat.name}
										class="aspect-square h-full w-full rounded-xl object-cover"
									/>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Right Column: Details -->
				<div class="lg:col-span-7">
					<div class="h-full space-y-6 rounded-[2.5rem] bg-white p-6 ring-1 ring-slate-100 sm:p-8">
						<!-- Title Header -->
						<div>
							<h1 class="font-cute text-4xl font-extrabold text-slate-800 md:text-5xl">
								{cat.name}
							</h1>
							<div class="mt-4 flex flex-wrap gap-2">
								<span
									class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600"
								>
									{getGenderLabel(cat.gender)}
								</span>
								<span
									class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600"
								>
									{getAgeLabel(cat.age_estimate)}
								</span>
								<span
									class={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${
										cat.is_neutered ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
									}`}
								>
									{cat.is_neutered ? '✂️ Sudah Steril' : 'Belum Steril'}
								</span>
							</div>
						</div>

						<!-- Description -->
						<div
							class="relative overflow-hidden rounded-3xl bg-[#fffdf5] p-6 ring-1 ring-[#fef08a]"
						>
							<h2
								class="relative mb-2 text-xs font-bold tracking-wider text-[#d97706]/70 uppercase"
							>
								Tentang {cat.name}
							</h2>
							<p class="relative text-base leading-relaxed text-slate-700">
								{formatValue(cat.description)}
							</p>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<!-- Color Card -->
							<div class="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
								<p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Warna Bulu</p>
								<div class="mt-2 flex items-center gap-3">
									<div
										class="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-400 shadow-md"
									></div>
									<p class="font-bold text-slate-700">{formatValue(cat.color)}</p>
								</div>
							</div>

							<!-- Health Notes Card -->
							<div class="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
								<p class="text-xs font-bold tracking-wider text-slate-400 uppercase">
									Catatan Kesehatan
								</p>
								<p class="mt-2 text-sm font-medium text-slate-600">
									{formatValue(cat.health_notes)}
								</p>
							</div>
						</div>

						<!-- Location Card -->
						<div
							class="group relative overflow-hidden rounded-3xl bg-blue-50 p-6 ring-1 ring-blue-100"
						>
							<div class="relative">
								<p class="mb-3 text-xs font-bold tracking-wider text-blue-400 uppercase">
									Lokasi Terkini
								</p>

								<div class="flex items-start gap-3">
									<div
										class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class="h-4 w-4"
										>
											<path
												fill-rule="evenodd"
												d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
									<div>
										<h3 class="text-lg font-bold text-slate-800">
											{formatValue(cat.location_name)}
										</h3>
										<p class="mt-1 text-sm font-medium text-slate-500">
											Patokan: {formatValue(cat.location_landmark)}
										</p>
										<div
											class="mt-3 flex w-fit items-center gap-2 rounded-lg bg-white/50 px-3 py-1.5 font-mono text-xs text-slate-400"
										>
											<span>Lat: {cat.latitude.toFixed(6)}</span>
											<span>•</span>
											<span>Long: {cat.longitude.toFixed(6)}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
