<script lang="ts">
	import { onMount } from 'svelte';
	import lottie, { type AnimationItem } from 'lottie-web';

	let {
		path,
		loop = true,
		autoplay = true,
		width = '100%',
		height = '100%',
		class: className = ''
	} = $props();

	let container: HTMLDivElement;
	let animation: AnimationItem;

	onMount(() => {
		if (container) {
			animation = lottie.loadAnimation({
				container,
				renderer: 'svg',
				loop,
				autoplay,
				path // path to your json file, e.g., '/animations/logo.json'
			});

			return () => {
				animation?.destroy();
			};
		}
	});
</script>

<div bind:this={container} style="width: {width}; height: {height};" class={className}></div>
