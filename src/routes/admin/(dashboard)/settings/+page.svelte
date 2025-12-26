<script lang="ts">
	import { onMount } from 'svelte';
	import { createSupabaseClient } from '$lib/supabase';
	import { signOut } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { User } from '@supabase/supabase-js';
	import { User as UserIcon, Lock, Download, Info, LogOut } from 'lucide-svelte';

	let user = $state<User | null>(null);
	let isLoading = $state(true);

	// Password change states
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isChangingPassword = $state(false);
	let passwordMessage = $state('');
	let passwordError = $state('');

	// Export states
	let isExporting = $state(false);

	const appVersion = '1.0.0';

	onMount(async () => {
		const supabase = createSupabaseClient();
		const { data } = await supabase.auth.getUser();
		user = data.user;
		isLoading = false;
	});

	async function handleChangePassword() {
		passwordMessage = '';
		passwordError = '';

		if (newPassword !== confirmPassword) {
			passwordError = 'Password baru tidak cocok dengan konfirmasi!';
			return;
		}

		if (newPassword.length < 6) {
			passwordError = 'Password minimal 6 karakter!';
			return;
		}

		isChangingPassword = true;

		try {
			const supabase = createSupabaseClient();
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) throw error;

			passwordMessage = 'Password berhasil diubah!';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (e: any) {
			passwordError = e.message || 'Gagal mengubah password';
		} finally {
			isChangingPassword = false;
		}
	}

	async function handleExportCats() {
		isExporting = true;

		try {
			const supabase = createSupabaseClient();
			const { data: cats, error } = await supabase
				.from('cats')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			if (!cats || cats.length === 0) {
				alert('Tidak ada data kucing untuk di-export!');
				return;
			}

			// Convert to CSV
			const headers = Object.keys(cats[0]);
			const csvContent = [
				headers.join(','),
				...cats.map((cat) =>
					headers
						.map((h) => {
							const val = cat[h as keyof typeof cat];
							if (val === null) return '';
							if (Array.isArray(val)) return `"${val.join(';')}"`;
							if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
							return val;
						})
						.join(',')
				)
			].join('\n');

			// Download
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `kocheng-jalanan-export-${new Date().toISOString().split('T')[0]}.csv`;
			link.click();
			URL.revokeObjectURL(url);
		} catch (e: any) {
			alert('Gagal export data: ' + e.message);
		} finally {
			isExporting = false;
		}
	}

	async function handleLogout() {
		await signOut();
		goto('/admin/login');
	}
</script>

<svelte:head>
	<title>Pengaturan - Admin</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-slate-800">Pengaturan</h1>
		<p class="mt-1 text-slate-500">Kelola akun dan preferensi admin</p>
	</div>

	{#if isLoading}
		<div class="flex h-64 items-center justify-center">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#dc419b]"
			></div>
		</div>
	{:else}
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Profil Admin -->
			<div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
				<div class="mb-4 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fcef04] to-[#dc419b]"
					>
						<UserIcon class="h-5 w-5 text-white" />
					</div>
					<h2 class="text-lg font-bold text-slate-800">Profil Admin</h2>
				</div>

				<div class="space-y-4">
					<div>
						<p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Email</p>
						<p class="mt-1 font-medium text-slate-700">{user?.email || '-'}</p>
					</div>

					<div>
						<p class="text-xs font-bold tracking-wider text-slate-400 uppercase">User ID</p>
						<p class="mt-1 font-mono text-xs text-slate-500">{user?.id || '-'}</p>
					</div>

					<div>
						<p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Login Terakhir</p>
						<p class="mt-1 text-sm text-slate-600">
							{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('id-ID') : '-'}
						</p>
					</div>

					<button
						onclick={handleLogout}
						class="mt-4 w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
					>
						Keluar dari Akun
					</button>
				</div>
			</div>

			<!-- Ganti Password -->
			<div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
				<div class="mb-4 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fcef04] to-[#dc419b]"
					>
						<Lock class="h-5 w-5 text-white" />
					</div>
					<h2 class="text-lg font-bold text-slate-800">Ganti Password</h2>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleChangePassword();
					}}
					class="space-y-4"
				>
					<div>
						<label
							for="new-password"
							class="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase"
						>
							Password Baru
						</label>
						<input
							id="new-password"
							type="password"
							bind:value={newPassword}
							placeholder="Minimal 6 karakter"
							class="w-full rounded-xl border-0 bg-slate-100 px-4 py-2.5 text-sm ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-[#dc419b]/50 focus:outline-none"
						/>
					</div>

					<div>
						<label
							for="confirm-password"
							class="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase"
						>
							Konfirmasi Password
						</label>
						<input
							id="confirm-password"
							type="password"
							bind:value={confirmPassword}
							placeholder="Ulangi password baru"
							class="w-full rounded-xl border-0 bg-slate-100 px-4 py-2.5 text-sm ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-[#dc419b]/50 focus:outline-none"
						/>
					</div>

					{#if passwordError}
						<p class="text-sm font-medium text-red-500">{passwordError}</p>
					{/if}

					{#if passwordMessage}
						<p class="text-sm font-medium text-green-600">{passwordMessage}</p>
					{/if}

					<button
						type="submit"
						disabled={isChangingPassword || !newPassword || !confirmPassword}
						class="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isChangingPassword ? 'Menyimpan...' : 'Ubah Password'}
					</button>
				</form>
			</div>

			<!-- Export Data -->
			<div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
				<div class="mb-4 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fcef04] to-[#dc419b]"
					>
						<Download class="h-5 w-5 text-white" />
					</div>
					<h2 class="text-lg font-bold text-slate-800">Export Data</h2>
				</div>

				<p class="mb-4 text-sm text-slate-500">
					Download seluruh data kucing dalam format CSV untuk backup atau analisis.
				</p>

				<button
					onclick={handleExportCats}
					disabled={isExporting}
					class="w-full rounded-xl bg-gradient-to-r from-[#fcef04] to-[#dc419b] px-4 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isExporting}
						Mengunduh...
					{:else}
						<span class="flex items-center justify-center gap-2"
							><Download class="h-4 w-4" /> Download CSV</span
						>
					{/if}
				</button>
			</div>

			<!-- Info Aplikasi -->
			<div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
				<div class="mb-4 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fcef04] to-[#dc419b]"
					>
						<Info class="h-5 w-5 text-white" />
					</div>
					<h2 class="text-lg font-bold text-slate-800">Info Aplikasi</h2>
				</div>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-500">Versi</span>
						<span class="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700"
							>{appVersion}</span
						>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-500">Framework</span>
						<span class="text-sm font-medium text-slate-700">SvelteKit + Supabase</span>
					</div>

					<div class="border-t border-slate-100 pt-3">
						<p class="text-center text-xs text-slate-400">
							🐱 Kocheng Jalanan<br />
							Peta interaktif kucing jalanan Indonesia
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
