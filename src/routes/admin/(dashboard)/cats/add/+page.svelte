<script lang="ts">
	import { goto } from '$app/navigation';
	import LocationPicker from '$lib/components/LocationPicker.svelte';
	import { addCat } from '$lib/stores/cats';
	import { uploadCatImages } from '$lib/utils/storage';
	import type { CatInsert } from '$lib/types/supabase';
	import { Camera, AlertCircle, Search, X, Loader2 } from 'lucide-svelte';

	// Form state
	let name = $state('');
	let description = $state('');
	let locationName = $state('');
	let locationLandmark = $state('');
	let latitude = $state(0);
	let longitude = $state(0);
	let gender = $state<'jantan' | 'betina' | 'unknown'>('unknown');
	let color = $state('');
	let ageEstimate = $state<'kitten' | 'dewasa' | 'senior'>('dewasa');
	let healthStatus = $state<'sehat' | 'sakit' | 'kritis'>('sehat');
	let healthNotes = $state('');
	let isNeutered = $state(false);

	// Location search
	type LocationSuggestion = {
		display_name: string;
		lat: string;
		lon: string;
	};

	let locationSuggestions = $state<LocationSuggestion[]>([]);
	let isLocationSearching = $state(false);
	let locationSearchTimeout: ReturnType<typeof setTimeout> | null = null;
	let locationAbortController: AbortController | null = null;
	let skipNextLocationSearch = false;

	function clearLocationSearch() {
		if (locationSearchTimeout) {
			clearTimeout(locationSearchTimeout);
			locationSearchTimeout = null;
		}
		if (locationAbortController) {
			locationAbortController.abort();
			locationAbortController = null;
		}
	}

	function applyLocationSuggestion(suggestion: LocationSuggestion) {
		clearLocationSearch();
		skipNextLocationSearch = true;
		locationName = suggestion.display_name;
		latitude = Number(suggestion.lat);
		longitude = Number(suggestion.lon);
		locationSuggestions = [];
		isLocationSearching = false;
	}

	async function fetchLocationSuggestions(query: string) {
		if (locationAbortController) {
			locationAbortController.abort();
		}
		locationAbortController = new AbortController();
		isLocationSearching = true;
		const currentQuery = query;
		try {
			const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`;
			const response = await fetch(url, {
				signal: locationAbortController.signal,
				headers: {
					'Accept-Language': 'id'
				}
			});
			if (!response.ok) {
				throw new Error('Gagal mencari lokasi');
			}
			const results = (await response.json()) as LocationSuggestion[];
			if (locationName.trim() === currentQuery) {
				locationSuggestions = results;
			}
		} catch (e: any) {
			if (e.name !== 'AbortError') {
				locationSuggestions = [];
			}
		} finally {
			isLocationSearching = false;
		}
	}

	function handleSearchLocation() {
		const query = locationName.trim();
		if (query.length < 2) {
			return;
		}
		locationSuggestions = [];
		fetchLocationSuggestions(query);
	}

	function closeSuggestions() {
		locationSuggestions = [];
	}

	// Image upload
	let imageFiles: FileList | null = $state(null);
	let imagePreviewUrls = $state<string[]>([]);

	// Loading state
	let isSubmitting = $state(false);
	let error = $state('');

	// Handle image selection
	function handleImageChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			imageFiles = input.files;
			// Create preview URLs
			imagePreviewUrls = Array.from(input.files).map((file) => URL.createObjectURL(file));
		}
	}

	// Remove image preview
	function removeImage(index: number) {
		const newUrls = [...imagePreviewUrls];
		newUrls.splice(index, 1);
		imagePreviewUrls = newUrls;
		// Note: We can't easily modify FileList, so we'll handle this during upload
	}

	// Submit form
	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		error = '';

		try {
			// Validate required fields
			if (!name.trim()) {
				throw new Error('Nama kocheng wajib diisi');
			}
			if (!latitude || !longitude) {
				throw new Error('Lokasi kocheng wajib dipilih di peta');
			}

			// Upload images if any
			let photoUrls: string[] = [];
			if (imageFiles && imageFiles.length > 0) {
				photoUrls = await uploadCatImages(Array.from(imageFiles));
			}

			// Prepare cat data
			const catData: CatInsert = {
				name: name.trim(),
				description: description.trim() || null,
				latitude,
				longitude,
				location_name: locationName.trim() || null,
				location_landmark: locationLandmark.trim() || null,
				gender,
				color: color.trim() || null,
				age_estimate: ageEstimate,
				health_status: healthStatus,
				health_notes: healthNotes.trim() || null,
				is_neutered: isNeutered,
				photos: photoUrls.length > 0 ? photoUrls : null,
				thumbnail_url: photoUrls[0] || null,
				is_active: true
			};

			// Add cat to database
			const result = await addCat(catData);

			if (result) {
				goto('/admin/cats');
			} else {
				throw new Error('Gagal menyimpan data kocheng');
			}
		} catch (e: any) {
			error = e.message || 'Terjadi kesalahan';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Tambah Kocheng - Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-cute text-3xl font-bold text-slate-800">Tambah Kocheng Baru</h1>
			<p class="mt-1 text-slate-500">Daftarkan kocheng jalanan yang kamu temui!</p>
		</div>
		<a
			href="/admin/cats"
			class="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-200"
		>
			← Kembali
		</a>
	</div>

	{#if error}
		<div class="flex items-center gap-2 rounded-xl bg-red-50/80 p-4 text-sm text-red-600">
			<AlertCircle class="h-5 w-5" />
			{error}
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-8">
		<!-- Basic Info -->
		<div
			class="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]"
		>
			<h2 class="mb-4 text-lg font-bold text-slate-700">Informasi Dasar</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-slate-600"
						>Nama Kocheng *</label
					>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
						placeholder="Si Manis"
					/>
				</div>
				<div>
					<label for="color" class="mb-1 block text-sm font-medium text-slate-600">Warna Bulu</label
					>
					<input
						type="text"
						id="color"
						bind:value={color}
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
						placeholder="Orange, Hitam Putih, dll"
					/>
				</div>
				<div>
					<label for="gender" class="mb-1 block text-sm font-medium text-slate-600"
						>Jenis Kelamin</label
					>
					<select
						id="gender"
						bind:value={gender}
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
					>
						<option value="unknown">Tidak Diketahui</option>
						<option value="jantan">Jantan ♂️</option>
						<option value="betina">Betina ♀️</option>
					</select>
				</div>
				<div>
					<label for="age" class="mb-1 block text-sm font-medium text-slate-600"
						>Perkiraan Usia</label
					>
					<select
						id="age"
						bind:value={ageEstimate}
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
					>
						<option value="kitten">Kitten 🐱</option>
						<option value="dewasa">Dewasa 🐈</option>
						<option value="senior">Senior 👴</option>
					</select>
				</div>
				<div class="md:col-span-2">
					<label for="description" class="mb-1 block text-sm font-medium text-slate-600"
						>Deskripsi</label
					>
					<textarea
						id="description"
						bind:value={description}
						rows="3"
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
						placeholder="Ceritakan tentang kocheng ini..."
					></textarea>
				</div>
				<div class="flex items-center gap-3">
					<input
						type="checkbox"
						id="neutered"
						bind:checked={isNeutered}
						class="h-5 w-5 cursor-pointer rounded border-2 border-slate-300 accent-orange-500"
					/>
					<label for="neutered" class="text-sm font-medium text-slate-600"
						>Sudah Steril / Kastrasi</label
					>
				</div>
			</div>
		</div>

		<!-- Health Status -->
		<div
			class="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]"
		>
			<h2 class="mb-4 text-lg font-bold text-slate-700">Status Kesehatan</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label for="health" class="mb-1 block text-sm font-medium text-slate-600"
						>Kondisi Kesehatan</label
					>
					<select
						id="health"
						bind:value={healthStatus}
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
					>
						<option value="sehat">💚 Sehat</option>
						<option value="sakit">💛 Sakit</option>
						<option value="kritis">❤️ Kritis / Butuh Pertolongan</option>
					</select>
				</div>
				<div>
					<label for="healthNotes" class="mb-1 block text-sm font-medium text-slate-600"
						>Catatan Kesehatan</label
					>
					<input
						type="text"
						id="healthNotes"
						bind:value={healthNotes}
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
						placeholder="Opsional: perlu obat mata, dll"
					/>
				</div>
			</div>
		</div>

		<!-- Location -->
		<div
			class="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]"
		>
			<h2 class="mb-4 text-lg font-bold text-slate-700">Lokasi</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="relative">
					<label for="locationName" class="mb-1 block text-sm font-medium text-slate-600"
						>Nama Lokasi</label
					>
					<div class="flex gap-2">
						<input
							type="text"
							id="locationName"
							bind:value={locationName}
							class="flex-1 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
							autocomplete="off"
							placeholder="Ketik nama lokasi..."
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
						/>
						<button
							type="button"
							onclick={handleSearchLocation}
							disabled={isLocationSearching || locationName.trim().length < 2}
							class="flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#fcef04] to-[#dc419b] px-5 py-3 font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isLocationSearching}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								<Search class="h-4 w-4" />
							{/if}
							Cari
						</button>
					</div>
					{#if locationSuggestions.length > 0}
						<div
							class="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg"
						>
							<div
								class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2"
							>
								<span class="text-xs font-bold text-slate-400 uppercase">Pilih Lokasi</span>
								<button
									type="button"
									onclick={closeSuggestions}
									class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
								>
									<X class="h-3 w-3" /> Tutup
								</button>
							</div>
							{#each locationSuggestions as suggestion}
								<button
									type="button"
									onclick={() => applyLocationSuggestion(suggestion)}
									class="w-full border-b border-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition-colors last:border-b-0 hover:bg-orange-50"
								>
									<span class="line-clamp-2">{suggestion.display_name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<div>
					<label for="landmark" class="mb-1 block text-sm font-medium text-slate-600"
						>Patokan / Landmark</label
					>
					<input
						type="text"
						id="landmark"
						bind:value={locationLandmark}
						class="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-600 transition-all outline-none placeholder:text-slate-300 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
						placeholder="Dekat warung makan"
					/>
				</div>
				<div class="md:col-span-2">
					<LocationPicker bind:latitude bind:longitude />
				</div>
			</div>
		</div>

		<!-- Photos -->
		<div
			class="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]"
		>
			<h2 class="mb-4 text-lg font-bold text-slate-700">Foto Kocheng</h2>
			<div>
				<label
					for="photos"
					class="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white/80 p-8 transition-colors hover:bg-orange-50/70"
				>
					<Camera class="mb-2 h-8 w-8 text-slate-400" />
					<span class="text-sm font-medium text-slate-600">Klik untuk upload foto</span>
					<span class="text-xs text-slate-400">JPG, PNG, max 5MB per foto</span>
					<input
						type="file"
						id="photos"
						accept="image/*"
						multiple
						class="hidden"
						onchange={handleImageChange}
					/>
				</label>
			</div>

			{#if imagePreviewUrls.length > 0}
				<div class="mt-4 grid grid-cols-3 gap-4 md:grid-cols-4">
					{#each imagePreviewUrls as url, i}
						<div class="group relative aspect-square overflow-hidden rounded-xl">
							<img src={url} alt="Preview" class="h-full w-full object-cover" />
							<button
								type="button"
								onclick={() => removeImage(i)}
								class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								<X class="h-4 w-4" />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Submit -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={isSubmitting}
				class="flex-1 rounded-2xl bg-linear-to-r from-[#fcef04] to-[#dc419b] py-3.5 text-lg font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? 'Menyimpan...' : 'Simpan Kocheng'}
			</button>
			<a
				href="/admin/cats"
				class="rounded-2xl bg-slate-100 px-8 py-3.5 text-lg font-bold text-slate-600 transition-all hover:bg-slate-200"
			>
				Batal
			</a>
		</div>
	</form>
</div>
