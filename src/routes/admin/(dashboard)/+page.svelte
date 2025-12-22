<script lang="ts">
	import { mockCats } from '$lib/data/mockCats';
	import { auth } from '$lib/stores/auth';

	const stats = {
		total: mockCats.length,
		sehat: mockCats.filter((c) => c.health_status === 'sehat').length,
		sakit: mockCats.filter((c) => c.health_status === 'sakit').length,
		kritis: mockCats.filter((c) => c.health_status === 'kritis').length
	};

	const recentCats = [...mockCats]
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		.slice(0, 5);
</script>

<svelte:head>
	<title>Dashboard - Kocheng Jalanan Admin</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Welcome Section -->
	<div
		class="flex items-center justify-between rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-8 shadow-sm"
	>
		<div>
			<h1 class="font-cute text-3xl font-bold text-slate-800">
				Selamat Datang, <span class="text-[#F97316]">{$auth?.name}!</span> 👋
			</h1>
			<p class="mt-2 text-lg font-medium text-slate-500">
				Siap untuk menyelamatkan lebih banyak kocheng hari ini?
			</p>
		</div>
		<div class="hidden animate-bounce text-6xl md:block">😺</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div
			class="group cursor-default rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
		>
			<div class="flex items-center gap-4">
				<div
					class="rounded-2xl bg-blue-50 p-4 text-3xl text-blue-500 transition-transform duration-300 group-hover:scale-110"
				>
					📊
				</div>
				<div>
					<p class="text-sm font-bold tracking-wider text-slate-400 uppercase">Total Kocheng</p>
					<p class="font-cute text-3xl font-bold text-slate-800">{stats.total}</p>
				</div>
			</div>
		</div>
		<div
			class="group cursor-default rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
		>
			<div class="flex items-center gap-4">
				<div
					class="rounded-2xl bg-green-50 p-4 text-3xl text-green-500 transition-transform duration-300 group-hover:scale-110"
				>
					😽
				</div>
				<div>
					<p class="text-sm font-bold tracking-wider text-slate-400 uppercase">Sehat</p>
					<p class="font-cute text-3xl font-bold text-slate-800">{stats.sehat}</p>
				</div>
			</div>
		</div>
		<div
			class="group cursor-default rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
		>
			<div class="flex items-center gap-4">
				<div
					class="rounded-2xl bg-yellow-50 p-4 text-3xl text-yellow-500 transition-transform duration-300 group-hover:scale-110"
				>
					😿
				</div>
				<div>
					<p class="text-sm font-bold tracking-wider text-slate-400 uppercase">Sakit</p>
					<p class="font-cute text-3xl font-bold text-slate-800">{stats.sakit}</p>
				</div>
			</div>
		</div>
		<div
			class="group cursor-default rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
		>
			<div class="flex items-center gap-4">
				<div
					class="rounded-2xl bg-red-50 p-4 text-3xl text-red-500 transition-transform duration-300 group-hover:scale-110"
				>
					🚑
				</div>
				<div>
					<p class="text-sm font-bold tracking-wider text-slate-400 uppercase">Darurat</p>
					<p class="font-cute text-3xl font-bold text-slate-800">{stats.kritis}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Cats -->
	<div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-8">
			<h2 class="font-cute flex items-center gap-2 text-xl font-bold text-slate-800">
				<span>🕒</span>
				Kocheng Terbaru
			</h2>
			<a
				href="/admin/cats"
				class="rounded-xl border border-orange-100 bg-white px-4 py-2 text-sm font-bold text-[#F97316] shadow-sm transition-colors hover:bg-orange-50"
			>
				Lihat Semua →
			</a>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-slate-600">
				<thead class="bg-slate-50/50 text-xs font-bold tracking-wider text-slate-400 uppercase">
					<tr>
						<th class="rounded-tl-2xl px-8 py-4">Nama</th>
						<th class="px-6 py-4">Lokasi</th>
						<th class="px-6 py-4">Status</th>
						<th class="rounded-tr-2xl px-6 py-4">Waktu</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#each recentCats as cat}
						<tr class="group transition-colors hover:bg-orange-50/30">
							<td class="flex items-center gap-3 px-8 py-5 font-bold text-slate-800">
								<span class="text-lg transition-transform duration-300 group-hover:scale-125"
									>🐱</span
								>
								{cat.name}
							</td>
							<td class="px-6 py-5">{cat.location_name || '-'}</td>
							<td class="px-6 py-5">
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
							<td class="px-6 py-5 font-medium text-slate-400">
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
