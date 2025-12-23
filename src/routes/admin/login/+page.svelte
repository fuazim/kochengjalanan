<script lang="ts">
	import { signIn } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Lottie from '$lib/components/Lottie.svelte';

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
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF7ED] p-4"
>
	<!-- Background Decorations -->
	<div
		class="absolute top-[-50px] right-[-50px] h-48 w-48 rounded-full bg-orange-200 opacity-50 blur-xl"
	></div>
	<div
		class="absolute bottom-[-20px] left-[-20px] h-32 w-32 rounded-full bg-yellow-200 opacity-50 blur-xl"
	></div>

	<div
		class="relative z-10 w-full max-w-md transform rounded-3xl border-2 border-orange-50 bg-white/80 p-8 shadow-xl shadow-orange-100/50 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.01]"
	>
		<div class="mb-8 text-center">
			<!-- Logo Wrapper Relative - Size kecil untuk layout -->
			<div class="relative mx-auto mb-6 flex h-12 w-12 items-center justify-center">
				<!-- Lottie Absolute & Oversized -->
				<div class="absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2">
					<Lottie path="/animations/logo.json" />
				</div>
			</div>
			<h1 class="font-cute text-3xl font-bold text-[#F97316]">Kocheng Jalanan</h1>
			<p class="font-medium text-gray-500">Portal Admin Paling Gemoy</p>
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
					class="w-full rounded-2xl border-2 border-orange-100 px-5 py-3 font-sans text-gray-700 transition-all outline-none placeholder:text-gray-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
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
					class="w-full rounded-2xl border-2 border-orange-100 px-5 py-3 font-sans text-gray-700 transition-all outline-none placeholder:text-gray-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				class="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-[#F97316] to-[#FB923C] py-3.5 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isLoading ? 'Sedang Memuat... 🐾' : 'Masuk Sekarang! 🚀'}
			</button>
		</form>

		<div class="mt-8 text-center text-sm text-gray-400">
			<a href="/" class="transition-colors hover:text-orange-500">← Kembali ke Peta</a>
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
