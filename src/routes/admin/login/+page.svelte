<script lang="ts">
	import { signIn } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Model3D from '$lib/components/Model3D.svelte';
	import RocketIcon from '$lib/components/RocketIcon.svelte';
	import PawIcon from '$lib/components/PawIcon.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		error = '';

		try {
			const result = await signIn(email, password);
			if (result.success) {
				goto('/admin');
			} else {
				error = result.error || 'Login gagal, cek email & password';
			}
		} catch (err) {
			error = 'Terjadi kesalahan sistem';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login Admin - Kocheng Jalanan</title>
</svelte:head>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4"
>
	<div
		class="relative z-10 w-full max-w-md rounded-3xl border border-gray-300 bg-white p-8"
	>
		<div class="mb-8 text-center">
			<!-- Logo Wrapper Relative - Size kecil untuk layout -->
			<div class="relative mx-auto mb-12 flex h-12 w-12 items-center justify-center">
				<!-- Model3D Absolute & Oversized -->
				<div class="absolute top-1/2 left-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-[5%] items-center justify-center">
					<Model3D modelPath="/models/cat-model.glb" width="200%" height="200%" />
				</div>
			</div>
			<h1 class="font-playwrite text-3xl font-normal bg-linear-to-r from-[#fcef04] to-[#dc419b] bg-clip-text text-transparent rotate-[-5deg] origin-center py-4">Kocheng</h1>
			<p class="font-medium text-gray-500">Siap untuk menyelamatkan kocheng hari ini?</p>
		</div>

		{#if error}
			<div
				class="animate-shake mb-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
			>
				<span>😿</span>
				{error}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-6">
			<div>
				<label for="email" class="mb-2 ml-1 block text-sm font-bold text-gray-600">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					class="w-full rounded-2xl bg-gray-50 px-5 py-3 font-sans text-gray-700 transition-all outline-none placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-pink-200"
					placeholder="admin@example.com"
				/>
			</div>

			<div>
				<label for="password" class="mb-2 ml-1 block text-sm font-bold text-gray-600"
					>Password</label
				>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					class="w-full rounded-2xl bg-gray-50 px-5 py-3 font-sans text-gray-700 transition-all outline-none placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-pink-200"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				class="w-full cursor-pointer rounded-2xl bg-linear-to-r from-[#fcef04] to-[#dc419b] py-3.5 text-lg font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
			>
				{#if isLoading}
					<span class="flex items-center gap-2">
						<span>Sedang Memuat...</span>
						<PawIcon size={18} />
					</span>
				{:else}
					<span>Masuk Sekarang!</span>
					<RocketIcon size={20} />
				{/if}
			</button>
		</form>

		<div class="mt-8 text-center text-sm text-gray-400">
			<a href="/" class="transition-colors hover:bg-linear-to-r hover:from-[#fcef04] hover:to-[#dc419b] hover:bg-clip-text hover:text-transparent">← Kembali ke Peta</a>
		</div>
	</div>
</div>

<style>
	/* Animasi Shake untuk error */
	.animate-shake {
		animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}

	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}
</style>
