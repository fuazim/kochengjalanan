<script lang="ts">
	interface Props {
		isOpen: boolean;
		title?: string;
		onClose: () => void;
		children?: import('svelte').Snippet;
	}

	let { isOpen, title, onClose, children }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			class="fixed inset-0 h-full w-full cursor-default bg-slate-900/50 backdrop-blur-sm transition-opacity"
			onclick={onClose}
			aria-label="Close modal"
		></button>

		<!-- Modal Content -->
		<div
			class="relative w-full max-w-lg transform overflow-hidden rounded-t-[2rem] bg-white p-6 shadow-2xl transition-all sm:rounded-[2rem] sm:p-8"
		>
			<!-- Header -->
			<div class="mb-6 flex items-center justify-between">
				{#if title}
					<h3 class="text-xl font-bold text-slate-800">{title}</h3>
				{/if}
				<button
					onclick={onClose}
					aria-label="Close modal"
					class="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>

			<!-- Body -->
			<div>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
