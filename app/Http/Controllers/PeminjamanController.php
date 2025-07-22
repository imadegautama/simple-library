<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function index()
    {
        $peminjaman = Peminjaman::select(
            'id_peminjaman',
            'id_anggota',
            'tanggal_pinjam',
            'tanggal_jatuh_tempo',
            'tanggal_kembali',
            'status',
            'denda',
            DB::raw('(SELECT name FROM users WHERE users.id = peminjaman.id_anggota) as nama_anggota')
        )
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Peminjaman/Index', [
            'peminjaman' => $peminjaman,
        ]);
    }

    public function create()
    {
        $bukuList = Buku::select('judul', 'penerbit', 'id_buku', 'stok')
            ->where('stok', '>', 0)
            ->get();
        $anggotaList = User::select('name', 'email', 'id')
            ->where('role', 'anggota')
            ->get();

        return Inertia::render('Peminjaman/Form', [
            'bukuList' => $bukuList,
            'anggotaList' => $anggotaList,
        ]);
    }


    public function store(Request $request)
    {
        // Validasi dasar
        $validated = $request->validate([
            'id_anggota' => 'required|exists:users,id',
            'tanggal_pinjam' => 'required|date',
            'tanggal_jatuh_tempo' => 'required|date|after:tanggal_pinjam',
            'catatan' => 'nullable|string|max:1000',
            'buku_ids' => 'required|array|min:1',
            'buku_ids.*' => 'required|exists:buku,id_buku',
        ], [
            'id_anggota.required' => 'Anggota harus dipilih.',
            'id_anggota.exists' => 'Anggota yang dipilih tidak valid.',
            'tanggal_pinjam.required' => 'Tanggal pinjam harus diisi.',
            'tanggal_pinjam.date' => 'Format tanggal pinjam tidak valid.',
            'tanggal_pinjam.after_or_equal' => 'Tanggal pinjam tidak boleh sebelum hari ini.',
            'tanggal_jatuh_tempo.required' => 'Tanggal jatuh tempo harus diisi.',
            'tanggal_jatuh_tempo.date' => 'Format tanggal jatuh tempo tidak valid.',
            'tanggal_jatuh_tempo.after' => 'Tanggal jatuh tempo harus setelah tanggal pinjam.',
            'buku_ids.required' => 'Minimal satu buku harus dipilih.',
            'buku_ids.min' => 'Minimal satu buku harus dipilih.',
            'buku_ids.*.required' => 'ID buku harus ada.',
            'buku_ids.*.exists' => 'Salah satu buku yang dipilih tidak valid.',
        ]);

        // Hapus duplikat buku dan filter yang kosong
        $bukuIds = array_unique(array_filter($validated['buku_ids']));

        if (empty($bukuIds)) {
            throw ValidationException::withMessages([
                'buku_ids' => 'Minimal satu buku harus dipilih.'
            ]);
        }

        DB::beginTransaction();

        try {
            // Validasi anggota
            $anggota = User::find($validated['id_anggota']);
            if ($anggota->role !== 'anggota') {
                throw ValidationException::withMessages([
                    'id_anggota' => 'User yang dipilih bukan anggota.'
                ]);
            }

            // Cek apakah anggota sudah meminjam maksimal 3 buku aktif
            $activeLoanCount = Peminjaman::where('id_anggota', $validated['id_anggota'])
                ->where('status', 'dipinjam')
                ->count();

            if ($activeLoanCount >= 3) {
                throw ValidationException::withMessages([
                    'id_anggota' => 'Anggota sudah meminjam maksimal 3 buku dan belum mengembalikan.'
                ]);
            }

            // Validasi stok buku dan ketersediaan
            $errors = [];
            foreach ($bukuIds as $bukuId) {
                $buku = Buku::find($bukuId);

                if (!$buku) {
                    $errors[] = "Buku dengan ID {$bukuId} tidak ditemukan.";
                    continue;
                }

                if ($buku->stok <= 0) {
                    $errors[] = "Buku '{$buku->judul}' tidak tersedia (stok habis).";
                    continue;
                }
            }

            if (!empty($errors)) {
                throw ValidationException::withMessages([
                    'buku_ids' => $errors
                ]);
            }

            // Cek apakah total peminjaman anggota + buku baru tidak melebihi 3
            if ($activeLoanCount + count($bukuIds) > 3) {
                throw ValidationException::withMessages([
                    'buku_ids' => 'Total peminjaman tidak boleh lebih dari 3 buku. Saat ini anggota sudah meminjam ' . $activeLoanCount . ' buku.'
                ]);
            }

            // Buat peminjaman
            $peminjaman = Peminjaman::create([
                'id_anggota' => $validated['id_anggota'],
                'tanggal_pinjam' => $validated['tanggal_pinjam'],
                'tanggal_jatuh_tempo' => $validated['tanggal_jatuh_tempo'],
                'status' => 'dipinjam',
                'denda' => 0,
                'catatan' => $validated['catatan'],
                'created_by' => Auth::id(),
            ]);

            // Buat detail peminjaman untuk setiap buku dan kurangi stok
            foreach ($bukuIds as $bukuId) {
                PeminjamanDetail::create([
                    'id_peminjaman' => $peminjaman->id_peminjaman,
                    'id_buku' => $bukuId,
                ]);

                // Kurangi stok buku
                $buku = Buku::find($bukuId);
                $buku->decrement('stok');
            }

            DB::commit();

            return redirect()->route('peminjaman.index')
                ->with('success', 'Peminjaman berhasil dibuat dengan ' . count($bukuIds) . ' buku.');
        } catch (ValidationException $e) {
            DB::rollback();
            throw $e;
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menyimpan peminjaman: ' . $e->getMessage()
            ]);
        }
    }

    public function edit(Peminjaman $peminjaman)
    {
        // Load relationships
        $peminjaman->load(['anggota', 'peminjamanDetails.buku']);

        $bukuList = Buku::select('judul', 'penerbit', 'id_buku', 'stok')
            ->get(); // Ambil semua buku untuk edit, karena buku yang dipinjam mungkin stoknya 0 sekarang

        $anggotaList = User::select('name', 'email', 'id')
            ->where('role', 'anggota')
            ->get();

        // Siapkan data peminjaman untuk form
        $peminjamanData = [
            'id_peminjaman' => $peminjaman->id_peminjaman,
            'id_anggota' => $peminjaman->id_anggota,
            'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
            'tanggal_jatuh_tempo' => $peminjaman->tanggal_jatuh_tempo,
            'tanggal_kembali' => $peminjaman->tanggal_kembali,
            'denda' => $peminjaman->denda,
            'status' => $peminjaman->status,
            'catatan' => $peminjaman->catatan,
            'buku_ids' => $peminjaman->peminjamanDetails->pluck('id_buku')->toArray(),
            'anggota' => $peminjaman->anggota,
            'peminjaman_details' => $peminjaman->peminjamanDetails->map(function ($detail) {
                return [
                    'id_peminjaman_detail' => $detail->id_peminjaman_detail,
                    'id_buku' => $detail->id_buku,
                    'buku' => $detail->buku
                ];
            })
        ];

        return Inertia::render('Peminjaman/Form', [
            'peminjaman' => $peminjamanData,
            'bukuList' => $bukuList,
            'anggotaList' => $anggotaList,
            'mode' => 'edit'
        ]);
    }

    public function update(Request $request, Peminjaman $peminjaman)
    {
        // Validasi dasar
        $validated = $request->validate([
            'id_anggota' => 'required|exists:users,id',
            'tanggal_pinjam' => 'required|date',
            'tanggal_jatuh_tempo' => 'required|date|after:tanggal_pinjam',
            'tanggal_kembali' => 'nullable|date|after_or_equal:tanggal_pinjam',
            'status' => 'required|in:dipinjam,dikembalikan,terlambat',
            'denda' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string|max:1000',
            'buku_ids' => 'required|array|min:1',
            'buku_ids.*' => 'required|exists:buku,id_buku',
        ], [
            'id_anggota.required' => 'Anggota harus dipilih.',
            'id_anggota.exists' => 'Anggota yang dipilih tidak valid.',
            'tanggal_pinjam.required' => 'Tanggal pinjam harus diisi.',
            'tanggal_pinjam.date' => 'Format tanggal pinjam tidak valid.',
            'tanggal_jatuh_tempo.required' => 'Tanggal jatuh tempo harus diisi.',
            'tanggal_jatuh_tempo.date' => 'Format tanggal jatuh tempo tidak valid.',
            'tanggal_jatuh_tempo.after' => 'Tanggal jatuh tempo harus setelah tanggal pinjam.',
            'tanggal_kembali.date' => 'Format tanggal kembali tidak valid.',
            'tanggal_kembali.after_or_equal' => 'Tanggal kembali tidak boleh sebelum tanggal pinjam.',
            'status.required' => 'Status harus dipilih.',
            'status.in' => 'Status yang dipilih tidak valid.',
            'denda.numeric' => 'Denda harus berupa angka.',
            'denda.min' => 'Denda tidak boleh negatif.',
            'buku_ids.required' => 'Minimal satu buku harus dipilih.',
            'buku_ids.min' => 'Minimal satu buku harus dipilih.',
            'buku_ids.*.required' => 'ID buku harus ada.',
            'buku_ids.*.exists' => 'Salah satu buku yang dipilih tidak valid.',
        ]);

        // Hapus duplikat buku dan filter yang kosong
        $bukuIds = array_unique(array_filter($validated['buku_ids']));

        if (empty($bukuIds)) {
            throw ValidationException::withMessages([
                'buku_ids' => 'Minimal satu buku harus dipilih.'
            ]);
        }

        DB::beginTransaction();

        try {
            // Validasi anggota
            $anggota = User::find($validated['id_anggota']);
            if ($anggota->role !== 'anggota') {
                throw ValidationException::withMessages([
                    'id_anggota' => 'User yang dipilih bukan anggota.'
                ]);
            }

            // Jika status berubah menjadi dikembalikan, set tanggal kembali otomatis jika belum diset
            if ($validated['status'] === 'dikembalikan' && empty($validated['tanggal_kembali'])) {
                $validated['tanggal_kembali'] = now()->format('Y-m-d');
            }

            // Jika status dikembalikan dan ada tanggal kembali, hitung denda otomatis jika belum diset
            if ($validated['status'] === 'dikembalikan' && $validated['tanggal_kembali']) {
                $tanggalKembali = new \DateTime($validated['tanggal_kembali']);
                $tanggalJatuhTempo = new \DateTime($validated['tanggal_jatuh_tempo']);

                if ($tanggalKembali > $tanggalJatuhTempo && !$validated['denda']) {
                    $terlambatHari = $tanggalKembali->diff($tanggalJatuhTempo)->days;
                    $validated['denda'] = $terlambatHari * 1000; // Rp 1.000 per hari
                }
            }

            // Get current borrowed books
            $currentBorrowedBooks = $peminjaman->peminjamanDetails->pluck('id_buku')->toArray();
            $newBooks = array_diff($bukuIds, $currentBorrowedBooks);
            $removedBooks = array_diff($currentBorrowedBooks, $bukuIds);

            // Validasi stok untuk buku baru yang ditambahkan
            if (!empty($newBooks)) {
                $errors = [];
                foreach ($newBooks as $bukuId) {
                    $buku = Buku::find($bukuId);

                    if (!$buku) {
                        $errors[] = "Buku dengan ID {$bukuId} tidak ditemukan.";
                        continue;
                    }

                    if ($buku->stok <= 0) {
                        $errors[] = "Buku '{$buku->judul}' tidak tersedia (stok habis).";
                        continue;
                    }
                }

                if (!empty($errors)) {
                    throw ValidationException::withMessages([
                        'buku_ids' => $errors
                    ]);
                }
            }

            // Cek batas peminjaman jika menambah buku baru
            if (!empty($newBooks)) {
                $activeLoanCount = Peminjaman::where('id_anggota', $validated['id_anggota'])
                    ->where('status', 'dipinjam')
                    ->where('id_peminjaman', '!=', $peminjaman->id_peminjaman)
                    ->count();

                if ($activeLoanCount + count($bukuIds) > 3) {
                    throw ValidationException::withMessages([
                        'buku_ids' => 'Total peminjaman tidak boleh lebih dari 3 buku. Saat ini anggota sudah meminjam ' . $activeLoanCount . ' buku lainnya.'
                    ]);
                }
            }

            // Update peminjaman
            $peminjaman->update([
                'id_anggota' => $validated['id_anggota'],
                'tanggal_pinjam' => $validated['tanggal_pinjam'],
                'tanggal_jatuh_tempo' => $validated['tanggal_jatuh_tempo'],
                'tanggal_kembali' => $validated['tanggal_kembali'],
                'status' => $validated['status'],
                'denda' => $validated['denda'] ?? $peminjaman->denda,
                'catatan' => $validated['catatan'],
            ]);

            // Update peminjaman details
            // Hapus detail yang tidak ada di buku baru dan kembalikan stok
            if (!empty($removedBooks)) {
                PeminjamanDetail::where('id_peminjaman', $peminjaman->id_peminjaman)
                    ->whereIn('id_buku', $removedBooks)
                    ->delete();

                // Kembalikan stok untuk buku yang dihapus (hanya jika status masih dipinjam)
                if ($peminjaman->status === 'dipinjam') {
                    foreach ($removedBooks as $bukuId) {
                        $buku = Buku::find($bukuId);
                        if ($buku) {
                            $buku->increment('stok');
                        }
                    }
                }
            }

            // Tambah detail untuk buku baru dan kurangi stok
            foreach ($newBooks as $bukuId) {
                PeminjamanDetail::create([
                    'id_peminjaman' => $peminjaman->id_peminjaman,
                    'id_buku' => $bukuId,
                ]);

                // Kurangi stok buku baru (hanya jika status masih dipinjam)
                if ($validated['status'] === 'dipinjam') {
                    $buku = Buku::find($bukuId);
                    if ($buku) {
                        $buku->decrement('stok');
                    }
                }
            }

            // Jika status berubah dari dipinjam ke dikembalikan, kembalikan stok semua buku
            if ($peminjaman->status === 'dipinjam' && $validated['status'] === 'dikembalikan') {
                foreach ($bukuIds as $bukuId) {
                    // Skip buku baru karena sudah tidak dikurangi stoknya di atas
                    if (!in_array($bukuId, $newBooks)) {
                        $buku = Buku::find($bukuId);
                        if ($buku) {
                            $buku->increment('stok');
                        }
                    }
                }
            }

            // Jika status berubah dari dikembalikan ke dipinjam, kurangi stok semua buku
            if ($peminjaman->status === 'dikembalikan' && $validated['status'] === 'dipinjam') {
                foreach ($bukuIds as $bukuId) {
                    // Skip buku baru karena sudah dikurangi stoknya di atas
                    if (!in_array($bukuId, $newBooks)) {
                        $buku = Buku::find($bukuId);
                        if ($buku && $buku->stok > 0) {
                            $buku->decrement('stok');
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('peminjaman.index')
                ->with('success', 'Peminjaman berhasil diperbarui dengan ' . count($bukuIds) . ' buku.');
        } catch (ValidationException $e) {
            DB::rollback();
            throw $e;
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat memperbarui peminjaman: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Peminjaman $peminjaman)
    {
        // Load relationships
        $peminjaman->load(['anggota', 'createdBy', 'peminjamanDetails.buku']);

        return Inertia::render('Peminjaman/Show', [
            'peminjaman' => $peminjaman
        ]);
    }

    public function destroy(Peminjaman $peminjaman)
    {
        // Cek apakah peminjaman masih aktif
        if ($peminjaman->status === 'dipinjam') {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus peminjaman yang masih aktif. Kembalikan buku terlebih dahulu.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Load detail peminjaman
            $peminjaman->load('peminjamanDetails');

            // Jika status dikembalikan, tidak perlu mengembalikan stok lagi
            // Karena stok sudah dikembalikan saat status diubah ke dikembalikan

            // Hapus detail peminjaman terlebih dahulu
            $peminjaman->peminjamanDetails()->delete();

            // Hapus peminjaman
            $peminjaman->delete();

            DB::commit();

            return redirect()->route('peminjaman.index')
                ->with('success', 'Data peminjaman berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menghapus peminjaman: ' . $e->getMessage()
            ]);
        }
    }

    public function returnBook(Request $request, $id)
    {
        $validated = $request->validate([
            'tanggal_pengembalian' => 'required|date',
            'denda' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::findOrFail($id);

            // Pastikan status masih dipinjam
            if ($peminjaman->status !== 'dipinjam') {
                throw ValidationException::withMessages([
                    'status' => 'Peminjaman ini sudah dikembalikan atau dibatalkan.'
                ]);
            }

            // Update status peminjaman
            $peminjaman->update([
                'status' => 'dikembalikan',
                'tanggal_kembali' => $validated['tanggal_pengembalian'],
                'denda' => $validated['denda'],
            ]);

            // Kembalikan stok buku yang dipinjam
            $detailPeminjaman = PeminjamanDetail::where('id_peminjaman', $id)->get();

            foreach ($detailPeminjaman as $detail) {
                $buku = Buku::find($detail->id_buku);
                if ($buku) {
                    $buku->increment('stok', 1);
                }
            }

            DB::commit();

            return redirect()->route('peminjaman.index')
                ->with('success', 'Buku berhasil dikembalikan' . ($validated['denda'] > 0 ? ' dengan denda Rp ' . number_format($validated['denda'], 0, ',', '.') : ''));
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat memproses pengembalian: ' . $e->getMessage()
            ]);
        }
    }
}
