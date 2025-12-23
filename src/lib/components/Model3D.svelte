<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	let {
		modelPath,
		width = '100%',
		height = '100%',
		class: className = ''
	} = $props();

	let container: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let model: THREE.Object3D | null = null;
	let mouseX = $state(0);
	let mouseY = $state(0);
	let targetRotationX = $state(0);
	let targetRotationY = $state(0);
	let animationFrameId: number | null = null;

	onMount(() => {
		if (!container) return;

		// Setup Scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);

		// Setup Camera
		camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		camera.position.z = 5;

		// Setup Renderer
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);

		// Basic lighting for glTF materials
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
		scene.add(ambientLight);

		const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
		keyLight.position.set(3, 5, 8);
		scene.add(keyLight);

		const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
		fillLight.position.set(-3, 2, 4);
		scene.add(fillLight);

		const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
		rimLight.position.set(0, 4, -6);
		scene.add(rimLight);

		// Load 3D Model
		const loader = new GLTFLoader();

		loader.load(
			modelPath,
			(gltf) => {
				model = gltf.scene;
				// Scale model if needed
				model.scale.set(1, 1, 1);
				scene.add(model);
			},
			undefined,
			(error) => {
				console.error('Error loading model:', error);
			}
		);

		// Mouse move handler
		function handleMouseMove(event: MouseEvent) {
			// Normalize mouse position (-1 to 1)
			mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			mouseY = (event.clientY / window.innerHeight) * 2 - 1;

			// Calculate target rotation (smooth following)
			targetRotationY = mouseX * 0.5; // Adjust multiplier for sensitivity
			targetRotationX = mouseY * 0.5;
		}

		window.addEventListener('mousemove', handleMouseMove);

		// Animation loop
		function animate() {
			animationFrameId = requestAnimationFrame(animate);

			if (model) {
				// Smooth rotation interpolation
				model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
				model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;
			}

			renderer.render(scene, camera);
		}

		animate();

		// Handle resize
		function handleResize() {
			if (!container) return;
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		}

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
			renderer.dispose();
		};
	});
</script>

<div bind:this={container} style="width: {width}; height: {height};" class={className}></div>

