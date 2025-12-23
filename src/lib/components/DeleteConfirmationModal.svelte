<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { 
		isOpen = false, 
		title = 'Hapus Kocheng?', 
		message = 'Yakin ingin menghapus data kocheng ini? Tindakan ini tidak bisa dibatalkan loh...', 
		onConfirm, 
		onCancel 
	} = $props();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
		<!-- Backdrop -->
		<div 
			class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
			onclick={onCancel}
            onkeydown={(e) => e.key === 'Escape' && onCancel()}
            role="button"
            tabindex="0"
		></div>

		<!-- Modal -->
		<div 
			class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
			transition:scale={{ duration: 300, start: 0.95 }}
		>
			<!-- Cute Decorative Elements -->
			<div class="absolute top-0 left-0 h-32 w-full bg-gradient-to-b from-orange-50 to-transparent opacity-50"></div>
			
			<div class="relative z-10 flex flex-col items-center text-center">
				<!-- Icon Wrapper with bouncing animation -->
				<div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-5xl shadow-sm animate-bounce">
					😿
				</div>

				<h3 class="font-cute mb-2 text-2xl font-bold text-slate-800">
					{title}
				</h3>
				
				<p class="mb-8 text-slate-500 leading-relaxed">
					{message}
				</p>

				<div class="grid w-full grid-cols-2 gap-3">
					<button
						onclick={onCancel}
						class="rounded-xl border-2 border-slate-100 bg-white px-4 py-3 font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95"
					>
						Batal
					</button>
					<button
						onclick={onConfirm}
						class="rounded-xl bg-red-500 px-4 py-3 font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-600 hover:-translate-y-0.5 active:scale-95"
					>
						Ya, Hapus
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
