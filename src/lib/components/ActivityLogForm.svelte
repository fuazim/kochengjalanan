<script lang="ts">
	import { addActivityLog } from '$lib/stores/activityLogs';
	import type { ActivityLogInsert } from '$lib/types/supabase';

	interface Props {
		catId: string;
		onLogAdded: () => void;
	}

	let { catId, onLogAdded }: Props = $props();

	let activityType = $state<'feeding' | 'health_check' | 'grooming' | 'other'>('feeding');
	let userName = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);
	let showSuccess = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;

		const logData: ActivityLogInsert = {
			cat_id: catId,
			activity_type: activityType,
			user_name: userName.trim() || 'Anonim',
			notes: notes.trim() || null
		};

		const result = await addActivityLog(logData);

		if (result) {
			// Reset form
			activityType = 'feeding';
			userName = '';
			notes = '';
			showSuccess = true;
			onLogAdded();

			// Hide success message after 3 seconds
			setTimeout(() => {
				showSuccess = false;
			}, 3000);
		}

		isSubmitting = false;
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Activity Type -->
	<div>
		<label
			for="activity-type"
			class="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase"
		>
			Jenis Aktivitas
		</label>
		<select
			id="activity-type"
			bind:value={activityType}
			class="w-full rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-[#dc419b]/50 focus:outline-none"
		>
			<option value="feeding">🍽️ Memberi Makan</option>
			<option value="health_check">💊 Cek Kesehatan</option>
			<option value="grooming">✂️ Grooming</option>
			<option value="other">📝 Lainnya</option>
		</select>
	</div>

	<!-- User Name -->
	<div>
		<label
			for="user-name"
			class="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase"
		>
			Nama Kamu <span class="font-normal text-slate-300">(opsional)</span>
		</label>
		<input
			id="user-name"
			type="text"
			bind:value={userName}
			placeholder="Anonim"
			class="w-full rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#dc419b]/50 focus:outline-none"
		/>
	</div>

	<!-- Notes -->
	<div>
		<label for="notes" class="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
			Catatan <span class="font-normal text-slate-300">(opsional)</span>
		</label>
		<textarea
			id="notes"
			bind:value={notes}
			rows="2"
			placeholder="Contoh: Dikasih whiskas 1 sachet..."
			class="w-full resize-none rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#dc419b]/50 focus:outline-none"
		></textarea>
	</div>

	<!-- Submit Button -->
	<button
		type="submit"
		disabled={isSubmitting}
		class="w-full rounded-xl bg-gradient-to-r from-[#fcef04] to-[#dc419b] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200/50 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
	>
		{#if isSubmitting}
			<span class="flex items-center justify-center gap-2">
				<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
						fill="none"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				Menyimpan...
			</span>
		{:else}
			✨ Catat Aktivitas
		{/if}
	</button>

	<!-- Success Message -->
	{#if showSuccess}
		<div
			class="animate-fade-in rounded-xl bg-green-50 p-3 text-center text-sm font-medium text-green-600 ring-1 ring-green-200"
		>
			✅ Aktivitas berhasil dicatat!
		</div>
	{/if}
</form>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>
