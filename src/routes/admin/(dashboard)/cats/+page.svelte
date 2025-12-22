<script lang="ts">
	import { onMount } from 'svelte';
	import { cats as catsStore, fetchCats, deleteCat, isLoading } from '$lib/stores/cats';
	import type { Cat } from '$lib/types/supabase';

	let searchQuery = $state('');
	let cats = $derived($catsStore);

	let filteredCats = $derived(
		cats.filter(
			(cat) =>
				cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(cat.location_name && cat.location_name.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	onMount(() => {
		fetchCats();
	});

	async function handleDelete(id: string) {
		if (confirm('Yakin ingin menghapus data kocheng ini? 😿')) {
			await deleteCat(id);
		}
	}
</script>

<svelte:head>
	<title>Kelola Kocheng - Kocheng Jalanan Admin</title>
</svelte:head>

<div class="space-y-6 pb-10">
	<!-- Header & Actions -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="font-cute text-3xl font-bold text-slate-800">Kelola Kocheng</h1>
			<p class="font-medium text-slate-500">Daftar semua anabul yang terdata.</p>
		</div>
		<a
			href="/admin/cats/add"
			class="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200/50"
		>
			<span class="text-xl">+</span> Tambah Kocheng
		</a>
	</div>

	<!-- Search & Filter -->
	<div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
		<div class="relative max-w-md">
			<svg
				class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama kocheng atau lokasi..."
				class="w-full rounded-2xl border-2 border-slate-100 py-3 pr-4 pl-12 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
			/>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-slate-600">
				<thead class="bg-slate-50/50 text-xs font-bold tracking-wider text-slate-400 uppercase">
					<tr>
						<th class="px-8 py-5">Kocheng</th>
						<th class="px-6 py-5">Lokasi</th>
						<th class="px-6 py-5">Status</th>
						<th class="px-6 py-5">Ditambahkan</th>
						<th class="px-6 py-5 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#if filteredCats.length === 0}
						<tr>
							<td
								colspan="5"
								class="flex flex-col items-center px-6 py-12 text-center text-slate-400"
							>
								<span class="mb-2 text-4xl opacity-50 grayscale">😿</span>
								<p>Tidak ada kocheng yang ditemukan.</p>
							</td>
						</tr>
					{:else}
						{#each filteredCats as cat}
							<tr class="group transition-colors hover:bg-orange-50/30">
								<td class="px-8 py-4">
									<div class="flex items-center gap-4">
										{#if cat.thumbnail_url}
											<img
												src={cat.thumbnail_url}
												alt={cat.name}
												class="h-12 w-12 rounded-2xl border border-slate-100 bg-slate-100 object-cover shadow-sm transition-transform duration-300 group-hover:scale-110"
											/>
										{:else}
											<div
												class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-100 text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
											>
												🐱
											</div>
										{/if}
										<div>
											<p class="font-cute text-lg font-bold text-slate-800">{cat.name}</p>
											{#if cat.gender}
												<p
													class="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400 capitalize"
												>
													{cat.gender}
												</p>
											{/if}
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<p class="font-bold text-slate-700">{cat.location_name || '-'}</p>
									{#if cat.location_landmark}
										<p class="text-xs font-medium text-slate-400">{cat.location_landmark}</p>
									{/if}
								</td>
								<td class="px-6 py-4">
									<span
										class="{cat.health_status === 'sehat'
											? 'border border-green-200 bg-green-100 text-green-600'
											: cat.health_status === 'sakit'
												? 'border border-yellow-200 bg-yellow-100 text-yellow-600'
												: 'border border-red-200 bg-red-100 text-red-600'} rounded-full px-3 py-1 text-xs font-bold capitalize shadow-sm"
									>
										{cat.health_status}
									</span>
								</td>
								<td class="px-6 py-4 font-medium text-slate-400">
									{new Date(cat.created_at).toLocaleDateString('id-ID', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})}
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<a
											href="/admin/cats/{cat.id}"
											class="transform rounded-xl p-2 text-blue-500 transition-colors duration-200 hover:scale-110 hover:bg-blue-50"
											title="Edit"
										>
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
										</a>
										<button
											onclick={() => handleDelete(cat.id)}
											class="transform rounded-xl p-2 text-red-500 transition-colors duration-200 hover:scale-110 hover:bg-red-50"
											title="Hapus"
										>
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
