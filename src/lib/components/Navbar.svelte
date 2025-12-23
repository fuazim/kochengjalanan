<script lang="ts">
	import Lottie from '$lib/components/Lottie.svelte';
</script>

<header
	class="relative z-20 shrink-0 border-b border-orange-100 bg-white/95 text-[#F97316] shadow-sm backdrop-blur-md"
>
	<div class="container mx-auto flex items-center justify-center px-4 py-3">
		<a href="/" class="group flex items-center gap-4 transition-transform hover:scale-105">
			<!-- Logo Wrapper Relative untuk Anchor -->
			<div class="relative flex h-10 w-10 items-center justify-center md:h-12 md:w-12">
				<!-- Lottie Absolute & Oversized -->
				<div
					class="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 md:h-24 md:w-24"
				>
					<Lottie path="/animations/logo.json" />
				</div>
			</div>
			<div>
				<h1 class="font-cute text-xl font-bold tracking-wide text-slate-800 md:text-3xl">
					Kocheng<span class="text-[#F97316]">Jalanan</span>
				</h1>
			</div>
		</a>
	</div>
</header>
