<script lang="ts">
	import { getActivityTypeLabel, formatRelativeTime } from '$lib/stores/activityLogs';
	import type { ActivityLog } from '$lib/types/supabase';
	import { Inbox, Utensils, Stethoscope, Scissors, FileText } from 'lucide-svelte';

	interface Props {
		logs: ActivityLog[];
		isLoading?: boolean;
	}

	let { logs, isLoading = false }: Props = $props();

	const iconMap = {
		feeding: Utensils,
		health_check: Stethoscope,
		grooming: Scissors,
		other: FileText
	};
</script>

<div class="space-y-3">
	{#if isLoading}
		<div class="flex items-center justify-center py-8">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#dc419b]"
			></div>
		</div>
	{:else if logs.length === 0}
		<div class="rounded-2xl bg-slate-50 p-6 text-center">
			<div class="mx-auto mb-2 flex justify-center text-slate-400">
				<Inbox class="h-8 w-8" />
			</div>
			<p class="text-sm font-medium text-slate-400">Belum ada aktivitas tercatat</p>
			<p class="mt-1 text-xs text-slate-300">Jadilah yang pertama mencatat!</p>
		</div>
	{:else}
		<div class="max-h-80 space-y-2 overflow-y-auto pr-1">
			{#each logs as log (log.id)}
				{@const Icon = iconMap[log.activity_type]}
				<div class="group rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100">
					<div class="flex items-start gap-3">
						<!-- Icon -->
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100"
						>
							<Icon class="h-5 w-5" />
						</div>

						<!-- Content -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between gap-2">
								<span class="text-sm font-bold text-slate-700">
									{getActivityTypeLabel(log.activity_type)}
								</span>
								<span class="shrink-0 text-xs text-slate-400">
									{formatRelativeTime(log.created_at)}
								</span>
							</div>

							<p class="mt-0.5 text-xs font-medium text-slate-500">
								oleh <span class="text-[#dc419b]">{log.user_name}</span>
							</p>

							{#if log.notes}
								<p class="mt-2 text-sm text-slate-600">
									{log.notes}
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Total count -->
		<p class="pt-2 text-center text-xs text-slate-400">
			Total {logs.length} aktivitas tercatat
		</p>
	{/if}
</div>
