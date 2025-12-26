<script lang="ts">
	import { onMount } from 'svelte';
	import { cats as catsStore, fetchCats, isLoading } from '$lib/stores/cats';
	import { auth } from '$lib/stores/auth';
	import {
		fetchAllActivityLogs,
		getActivityTypeLabel,
		formatRelativeTime,
		type ActivityLogWithCat
	} from '$lib/stores/activityLogs';
	import CatIcon from '$lib/components/CatIcon.svelte';
	import CatIconAll from '$lib/components/CatIconAll.svelte';
	import { Utensils, Stethoscope, Scissors, FileText, Activity, Cat } from 'lucide-svelte';

	let cats = $derived($catsStore);

	// Activity logs state
	let activityLogs = $state<ActivityLogWithCat[]>([]);
	let isLoadingLogs = $state(true);

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

	// Icon map for activity types
	const iconMap = {
		feeding: Utensils,
		health_check: Stethoscope,
		grooming: Scissors,
		other: FileText
	};

	onMount(async () => {
		fetchCats();
		// Load activity logs
		activityLogs = await fetchAllActivityLogs(8);
		isLoadingLogs = false;
	});
</script>

<svelte:head>
	<title>Dashboard - Kocheng Jalanan Admin</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Welcome Section -->
	<div class="relative overflow-hidden rounded-4xl bg-linear-to-r from-[#fcef04] to-[#dc419b] p-10">
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
					<p
						class="bg-linear-to-r from-[#fcef04] to-[#dc419b] bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase"
					>
						Total Kocheng
					</p>
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

	<!-- Two Column Layout: Recent Cats & Activity Logs -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Recent Cats -->
		<div class="overflow-hidden rounded-4xl bg-white">
			<div class="flex items-center justify-between p-6">
				<h2 class="font-cute flex items-center gap-3 text-xl font-bold text-slate-800">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fcef04] to-[#dc419b]"
					>
						<Cat class="h-5 w-5 text-white" />
					</div>
					Kocheng Terbaru
				</h2>
				<a
					href="/admin/cats"
					class="text-sm font-bold text-slate-400 transition-colors hover:text-[#dc419b]"
				>
					Lihat Semua →
				</a>
			</div>
			<div class="space-y-2 px-6 pb-6">
				{#each recentCats.slice(0, 5) as cat}
					<a
						href="/cats/{cat.slug || cat.id}"
						class="group flex items-center gap-4 rounded-2xl p-3 transition-all hover:bg-slate-50"
					>
						<div class="relative h-12 w-12 shrink-0">
							{#if cat.thumbnail_url}
								<img
									src={cat.thumbnail_url}
									alt={cat.name}
									class="h-full w-full rounded-xl object-cover transition-transform group-hover:scale-105"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center rounded-xl bg-pink-50">
									<Cat class="h-6 w-6 text-[#dc419b]" />
								</div>
							{/if}
							<div
								class="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white {cat.health_status ===
								'sehat'
									? 'bg-green-400'
									: cat.health_status === 'sakit'
										? 'bg-yellow-400'
										: 'bg-red-400'}"
							></div>
						</div>
						<div class="min-w-0 flex-1">
							<p
								class="truncate font-bold text-slate-800 transition-colors group-hover:text-[#dc419b]"
							>
								{cat.name}
							</p>
							<p class="truncate text-xs text-slate-400">
								{cat.location_name || 'Lokasi tidak diketahui'}
							</p>
						</div>
						<span class="text-xs text-slate-300">
							{new Date(cat.created_at).toLocaleDateString('id-ID', {
								day: 'numeric',
								month: 'short'
							})}
						</span>
					</a>
				{/each}
				{#if recentCats.length === 0}
					<div class="py-8 text-center text-slate-400">
						<Cat class="mx-auto mb-2 h-12 w-12 opacity-50" />
						<p class="text-sm">Belum ada kocheng terdaftar</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Activity Logs -->
		<div class="overflow-hidden rounded-4xl bg-white">
			<div class="flex items-center justify-between p-6">
				<h2 class="font-cute flex items-center gap-3 text-xl font-bold text-slate-800">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500"
					>
						<Activity class="h-5 w-5 text-white" />
					</div>
					Aktivitas Terbaru
				</h2>
				<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
					{activityLogs.length} log
				</span>
			</div>
			<div class="max-h-[400px] space-y-2 overflow-y-auto px-6 pb-6">
				{#if isLoadingLogs}
					<div class="flex items-center justify-center py-8">
						<div
							class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#dc419b]"
						></div>
					</div>
				{:else if activityLogs.length === 0}
					<div class="py-8 text-center text-slate-400">
						<Activity class="mx-auto mb-2 h-12 w-12 opacity-50" />
						<p class="text-sm">Belum ada aktivitas tercatat</p>
					</div>
				{:else}
					{#each activityLogs as log (log.id)}
						{@const Icon = iconMap[log.activity_type] || FileText}
						<a
							href="/cats/{log.cat?.slug || log.cat_id}"
							class="group flex items-start gap-3 rounded-2xl p-3 transition-all hover:bg-slate-50"
						>
							<!-- Activity Icon -->
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#dc419b]/10 group-hover:text-[#dc419b]"
							>
								<Icon class="h-5 w-5" />
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="text-sm font-bold text-slate-700"
										>{getActivityTypeLabel(log.activity_type)}</span
									>
									<span class="text-[10px] text-slate-300">•</span>
									<span class="text-xs text-slate-400">{formatRelativeTime(log.created_at)}</span>
								</div>
								<p class="mt-0.5 text-xs text-slate-500">
									<span class="font-medium text-[#dc419b]">{log.user_name}</span>
									{#if log.cat}
										→ <span class="font-medium text-slate-600">{log.cat.name}</span>
									{/if}
								</p>
								{#if log.notes}
									<p class="mt-1 line-clamp-1 text-xs text-slate-400">{log.notes}</p>
								{/if}
							</div>

							<!-- Cat Thumbnail -->
							{#if log.cat?.thumbnail_url}
								<div class="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
									<img
										src={log.cat.thumbnail_url}
										alt={log.cat.name}
										class="h-full w-full object-cover"
									/>
								</div>
							{/if}
						</a>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
