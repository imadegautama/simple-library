<?php

namespace App\Http\Controllers;

use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class AnggotaDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Data peminjaman untuk anggota yang sedang login
        $peminjamanAktif = Peminjaman::with(['peminjamanDetails.buku'])
            ->where('id_anggota', $user->id)
            ->where('status', 'dipinjam')
            ->get()
            ->map(function ($peminjaman) {
                return [
                    'id_peminjaman' => $peminjaman->id_peminjaman,
                    'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                    'tanggal_jatuh_tempo' => $peminjaman->tanggal_jatuh_tempo,
                    'status' => $peminjaman->status,
                    'catatan' => $peminjaman->catatan,
                    'buku' => $peminjaman->peminjamanDetails->map(function ($detail) {
                        return [
                            'judul' => $detail->buku->judul ?? 'N/A',
                            'pengarang' => $detail->buku->pengarang ?? 'N/A',
                            'penerbit' => $detail->buku->penerbit ?? 'N/A',
                        ];
                    }),
                    'is_terlambat' => Carbon::parse($peminjaman->tanggal_jatuh_tempo)->isPast(),
                    'hari_terlambat' => Carbon::parse($peminjaman->tanggal_jatuh_tempo)->isPast()
                        ? Carbon::parse($peminjaman->tanggal_jatuh_tempo)->diffInDays(Carbon::now())
                        : 0,
                ];
            });

        // Riwayat peminjaman yang sudah dikembalikan
        $riwayatPeminjaman = Peminjaman::with(['peminjamanDetails.buku'])
            ->where('id_anggota', $user->id)
            ->where('status', 'dikembalikan')
            ->orderBy('tanggal_kembali', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($peminjaman) {
                return [
                    'id_peminjaman' => $peminjaman->id_peminjaman,
                    'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                    'tanggal_jatuh_tempo' => $peminjaman->tanggal_jatuh_tempo,
                    'tanggal_kembali' => $peminjaman->tanggal_kembali,
                    'denda' => $peminjaman->denda,
                    'status' => $peminjaman->status,
                    'buku' => $peminjaman->peminjamanDetails->map(function ($detail) {
                        return [
                            'judul' => $detail->buku->judul ?? 'N/A',
                            'pengarang' => $detail->buku->pengarang ?? 'N/A',
                            'penerbit' => $detail->buku->penerbit ?? 'N/A',
                        ];
                    }),
                ];
            });

        // Statistik untuk anggota
        $totalPeminjaman = Peminjaman::where('id_anggota', $user->id)->count();
        $bukuDipinjam = Peminjaman::where('id_anggota', $user->id)
            ->where('status', 'dipinjam')
            ->count();
        $totalTerlambat = Peminjaman::where('id_anggota', $user->id)
            ->where('status', 'dipinjam')
            ->where('tanggal_jatuh_tempo', '<', Carbon::now())
            ->count();
        $totalDenda = Peminjaman::where('id_anggota', $user->id)
            ->where('status', 'dikembalikan')
            ->sum('denda');

        return Inertia::render('AnggotaDashboard', [
            'peminjamanAktif' => $peminjamanAktif,
            'riwayatPeminjaman' => $riwayatPeminjaman,
            'stats' => [
                'totalPeminjaman' => $totalPeminjaman,
                'bukuDipinjam' => $bukuDipinjam,
                'totalTerlambat' => $totalTerlambat,
                'totalDenda' => $totalDenda,
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
