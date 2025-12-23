<script lang="ts">
	import { onMount } from 'svelte';
	import { cats as catsStore, fetchCats, isLoading } from '$lib/stores/cats';
	import { auth } from '$lib/stores/auth';
	import CatIcon from '$lib/components/CatIcon.svelte';
	import CatIconAll from '$lib/components/CatIconAll.svelte';

	let cats = $derived($catsStore);

	// Statistik dari data real
	let stats = $derived({
		total: cats.length,
		sehat: cats.filter((c) => c.health_status === 'sehat').length,
		sakit: cats.filter((c) => c.health_status === 'sakit').length,
		kritis: cats.filter((c) => c.health_status === 'kritis').length
	});

	// 5 kucing terbaru
	let recentCats = $derived(
		[...cats]
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
			.slice(0, 5)
	);

	onMount(() => {
		fetchCats();
	});
</script>

<svelte:head>
	<title>Dashboard - Kocheng Jalanan Admin</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Welcome Section -->
	<div
		class="relative overflow-hidden rounded-4xl bg-linear-to-r from-[#fcef04] to-[#dc419b] p-10"
	>
		<div class="relative z-10">
			<div>
				<h1 class="font-cute text-4xl font-bold text-white">
					Selamat Datang, <span class="text-white">{$auth?.email?.split('@')[0] || 'Admin'}!</span>
				</h1>
				<p class="mt-3 text-lg font-medium text-white/90">
					Siap untuk menyelamatkan dan menyayangi lebih banyak kocheng hari ini? 😻
				</p>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- Total Kocheng Card -->
		<div
			class="group relative overflow-hidden rounded-4xl border border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1"
		>
			<div class="relative flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r from-[#fcef04] to-[#dc419b] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
				>
					<CatIconAll color="#ffffff" size={32} />
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider bg-linear-to-r from-[#fcef04] to-[#dc419b] bg-clip-text text-transparent uppercase">Total Kocheng</p>
					<p class="font-cute text-4xl font-bold text-slate-800">{stats.total}</p>
				</div>
			</div>
		</div>

		<!-- Sehat Card -->
		<div
			class="group relative overflow-hidden rounded-4xl border border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1"
		>
			<div class="relative flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
				>
					<CatIcon color="#10b981" size={32} />
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-green-500 uppercase">Sehat Walafiat</p>
					<p class="font-cute text-4xl font-bold text-slate-800">{stats.sehat}</p>
				</div>
			</div>
		</div>

		<!-- Sakit Card -->
		<div
			class="group relative overflow-hidden rounded-4xl border border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1"
		>
			<div class="relative flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
				>
					<CatIcon color="#f59e0b" size={32} />
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-yellow-500 uppercase">Sedang Sakit</p>
					<p class="font-cute text-4xl font-bold text-slate-800">{stats.sakit}</p>
				</div>
			</div>
		</div>

		<!-- Darurat Card -->
		<div
			class="group relative overflow-hidden rounded-4xl border border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1"
		>
			<div class="relative flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
				>
					<CatIcon color="#ef4444" size={32} />
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-red-400 uppercase">Butuh Bantuan</p>
					<p class="font-cute text-4xl font-bold text-slate-800">{stats.kritis}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Cats -->
	<div
		class="overflow-hidden rounded-4xl bg-white"
	>
		<div class="flex items-center justify-between p-8">
			<h2 class="font-cute flex items-center gap-3 text-2xl font-bold text-slate-800">
				<svg class="h-8 w-8 bg-linear-to-r from-[#fcef04] to-[#dc419b] bg-clip-text text-transparent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				Kocheng Terbaru
			</h2>
			<a
				href="/admin/cats"
				class="group flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold bg-linear-to-r from-[#fcef04] to-[#dc419b] bg-clip-text text-transparent transition-all hover:pl-6"
			>
				Lihat Semua <span class="transition-transform group-hover:translate-x-1">→</span>
			</a>
		</div>
		<div class="overflow-x-auto p-2">
			<table class="w-full text-left text-sm text-slate-600">
				<thead class="text-xs font-bold tracking-wider text-slate-400 uppercase">
					<tr>
						<th class="px-8 py-4 pl-10">Nama Kocheng</th>
						<th class="px-6 py-4">Lokasi</th>
						<th class="px-6 py-4">Status</th>
						<th class="px-6 py-4 pr-10 text-right">Waktu</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#each recentCats as cat}
						<tr class="group rounded-2xl transition-colors hover:bg-pink-50/50">
							<td class="px-8 py-4 pl-10">
								<div class="flex items-center gap-4">
									<div
										class="relative h-12 w-12 shrink-0 transition-transform duration-300 group-hover:scale-110"
									>
										{#if cat.thumbnail_url}
											<img
												src={cat.thumbnail_url}
												alt={cat.name}
												class="h-full w-full rounded-2xl object-cover"
											/>
										{:else}
											<div
												class="flex h-full w-full items-center justify-center rounded-2xl bg-pink-50"
											>
												<svg class="h-8 w-8" viewBox="0 0 24 24" fill="#dc419b">
													<path
														d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21 1.35.33 2.74.33 4.16 0 4.41-3.59 8-8 8z"
														opacity=".3"
													/>
													<path
														d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21 1.35.33 2.74.33 4.16 0 4.41-3.59 8-8 8z"
													/>
												</svg>
											</div>
										{/if}
										<div
											class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-green-400"
										></div>
									</div>
									<div>
										<p
											class="font-cute text-lg font-bold text-slate-800 transition-colors group-hover:bg-linear-to-r group-hover:from-[#fcef04] group-hover:to-[#dc419b] group-hover:bg-clip-text group-hover:text-transparent"
										>
											{cat.name}
										</p>
										{#if cat.gender}
											<p class="text-xs font-medium text-slate-400 capitalize">{cat.gender}</p>
										{/if}
									</div>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center gap-2">
									<svg
										class="h-4 w-4 text-slate-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
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
									<span class="font-medium text-slate-700">{cat.location_name || '-'}</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<span
									class="{cat.health_status === 'sehat'
										? 'bg-green-100 text-green-700'
										: cat.health_status === 'sakit'
											? 'bg-yellow-100 text-yellow-700'
											: 'bg-red-100 text-red-700'} inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize"
								>
									<span
										class="h-1.5 w-1.5 rounded-full {cat.health_status === 'sehat'
											? 'bg-green-500'
											: cat.health_status === 'sakit'
												? 'bg-yellow-500'
												: 'bg-red-500'}"
									></span>
									{cat.health_status}
								</span>
							</td>
							<td class="px-6 py-4 pr-10 text-right text-xs font-medium text-slate-400">
								{new Date(cat.created_at).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'long',
									year: 'numeric'
								})}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
</style>
