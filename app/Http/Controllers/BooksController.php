<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BooksController extends Controller
{
    /**
     * Show all available books with pagination and search
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $perPage = 12;

        $booksQuery = Buku::query()
            ->where('stok', '>', 0)
            ->orderBy('created_at', 'desc');

        // Add search functionality
        if ($search) {
            $booksQuery->where(function ($query) use ($search) {
                $query->where('judul', 'like', '%' . $search . '%')
                    ->orWhere('penulis', 'like', '%' . $search . '%')
                    ->orWhere('penerbit', 'like', '%' . $search . '%');
            });
        }

        $books = $booksQuery->paginate($perPage)->through(function ($buku) {
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

        return Inertia::render('books/index', [
            'books' => $books,
            'search' => $search,
            'totalBooks' => Buku::where('stok', '>', 0)->count(),
        ]);
    }
}
