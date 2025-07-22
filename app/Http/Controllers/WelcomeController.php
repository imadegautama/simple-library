<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\Kategori;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Show the welcome page with available books.
     */
    public function index(): Response
    {
        // Ambil buku yang tersedia (stok > 0) dengan limit untuk performance
        $bukuTersedia = Buku::where('stok', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit(12) // Batasi 12 buku untuk landing page
            ->get()
            ->map(function ($buku) {
                return [
                    'id' => $buku->id_buku,
                    'judul' => $buku->judul,
                    'pengarang' => $buku->penulis,
                    'penerbit' => $buku->penerbit,
                    'tahun_terbit' => $buku->tahun_terbit,
                    'stok' => $buku->stok,
                    'deskripsi' => $buku->deskripsi,
                    'cover' => $buku->cover,
                ];
            });

        // Statistik perpustakaan
        $stats = [
            'totalBuku' => Buku::count(),
            'bukuTersedia' => Buku::where('stok', '>', 0)->count(),
            'memberCount' => User::where('role', 'anggota')->count(),
            'totalPeminjaman' => \App\Models\Peminjaman::count(),
        ];

        return Inertia::render('welcome', [
            'bukuTersedia' => $bukuTersedia,
            'stats' => $stats,
        ]);
    }
}
