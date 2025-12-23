<script lang="ts">
	import Model3D from '$lib/components/Model3D.svelte';
</script>

<header
	class="relative z-20 shrink-0 overflow-visible bg-white/95 backdrop-blur-md"
>
	<div class="container mx-auto flex items-center justify-center overflow-visible px-4 py-2">
		<a href="/" class="group flex items-center gap-4 overflow-visible transition-transform hover:scale-105">
			<!-- Logo Wrapper Relative untuk Anchor -->
			<div class="relative flex h-10 w-10 items-center justify-center md:h-12 md:w-12">
				<!-- Model3D Absolute & Oversized -->
				<div
					class="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 md:h-24 md:w-24 pb-3"
				>
					<Model3D modelPath="/models/cat-model.glb" width="120%" height="120%" />
				</div>
			</div>
			<div class="overflow-visible">
				<h1 class="font-playwrite text-xl font-normal bg-linear-to-r from-[#fcef04] to-[#dc419b] bg-clip-text text-transparent md:text-3xl py-4 rotate-[-5deg] origin-center">
					Kocheng
				</h1>
			</div>
		</a>
	</div>
</header>
