<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistik dasar
        $totalBuku = Buku::count();
        $totalAnggota = User::where('role', 'anggota')->count();
        $totalPeminjaman = Peminjaman::count();
        $bukuDipinjam = Peminjaman::where('status', 'dipinjam')->count();

        // Stok buku
        $totalStokBuku = Buku::sum('stok');
        $bukuTersedia = Buku::where('stok', '>', 0)->count();
        $bukuHabis = Buku::where('stok', '=', 0)->count();

        // Statistik peminjaman
        $peminjamanHariIni = Peminjaman::whereDate('tanggal_pinjam', today())->count();
        $pengembalianHariIni = Peminjaman::whereDate('tanggal_kembali', today())->count();
        $peminjamanTerlambat = Peminjaman::where('status', 'dipinjam')
            ->where('tanggal_jatuh_tempo', '<', today())
            ->count();

        // Denda yang belum dibayar
        $totalDenda = Peminjaman::where('status', 'dikembalikan')
            ->where('denda', '>', 0)
            ->sum('denda');

        // Peminjaman bulan ini
        $peminjamanBulanIni = Peminjaman::whereMonth('tanggal_pinjam', now()->month)
            ->whereYear('tanggal_pinjam', now()->year)
            ->count();

        // Statistik chart untuk 7 hari terakhir
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $chartData[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'peminjaman' => Peminjaman::whereDate('tanggal_pinjam', $date)->count(),
                'pengembalian' => Peminjaman::whereDate('tanggal_kembali', $date)->count(),
            ];
        }

        // Buku paling populer (paling sering dipinjam)
        $bukuPopuler = DB::table('peminjaman_detail')
            ->join('buku', 'peminjaman_detail.id_buku', '=', 'buku.id_buku')
            ->select('buku.judul', 'buku.penulis', DB::raw('count(*) as total_dipinjam'))
            ->groupBy('buku.id_buku', 'buku.judul', 'buku.penulis')
            ->orderBy('total_dipinjam', 'desc')
            ->limit(5)
            ->get();

        // Anggota paling aktif
        $anggotaAktif = User::select('users.name', 'users.email', DB::raw('count(peminjaman.id_peminjaman) as total_peminjaman'))
            ->leftJoin('peminjaman', 'users.id', '=', 'peminjaman.id_anggota')
            ->where('users.role', 'anggota')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_peminjaman', 'desc')
            ->limit(5)
            ->get();

        // Aktivitas peminjaman terbaru (untuk laporan)
        $recentActivities = DB::table('peminjaman')
            ->join('users', 'peminjaman.id_anggota', '=', 'users.id')
            ->join('peminjaman_detail', 'peminjaman.id_peminjaman', '=', 'peminjaman_detail.id_peminjaman')
            ->join('buku', 'peminjaman_detail.id_buku', '=', 'buku.id_buku')
            ->select(
                'peminjaman.id_peminjaman as id',
                'users.name as anggota_nama',
                'buku.judul as judul_buku',
                'peminjaman.tanggal_pinjam',
                'peminjaman.tanggal_kembali',
                'peminjaman.status',
                'peminjaman.denda'
            )
            ->orderBy('peminjaman.tanggal_pinjam', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalBuku' => $totalBuku,
                'totalAnggota' => $totalAnggota,
                'totalPeminjaman' => $totalPeminjaman,
                'bukuDipinjam' => $bukuDipinjam,
                'totalStokBuku' => $totalStokBuku,
                'bukuTersedia' => $bukuTersedia,
                'bukuHabis' => $bukuHabis,
                'peminjamanHariIni' => $peminjamanHariIni,
                'pengembalianHariIni' => $pengembalianHariIni,
                'peminjamanTerlambat' => $peminjamanTerlambat,
                'totalDenda' => $totalDenda,
                'peminjamanBulanIni' => $peminjamanBulanIni,
            ],
            'chartData' => $chartData,
            'bukuPopuler' => $bukuPopuler,
            'anggotaAktif' => $anggotaAktif,
            'recentActivities' => $recentActivities,
        ]);
    }
}
