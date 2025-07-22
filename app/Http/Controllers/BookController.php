<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index()
    {
        $buku = Buku::all();
        return Inertia::render('Buku/Index', [
            'buku' => $buku, // Replace with actual data retrieval logic
        ]);
    }

    public function create()
    {
        return Inertia::render('Buku/Form');
    }

    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'tahun_terbit' => 'required|integer|min:1900|max:' . date('Y'),
            'isbn' => 'nullable|string|unique:buku,isbn',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
            'cover' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        // Handle cover upload
        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('covers', 'public');
        }

        // Insert into database
        try {
            Buku::create([
                'judul' => $validated['judul'],
                'penulis' => $validated['penulis'],
                'penerbit' => $validated['penerbit'],
                'tahun_terbit' => $validated['tahun_terbit'],
                'isbn' => $validated['isbn'],
                'deskripsi' => $validated['deskripsi'],
                'stok' => $validated['stok'],
                'cover' => $coverPath,
            ]);

            return redirect()->route('buku.index')
                ->with('success', 'Buku berhasil ditambahkan!');
        } catch (\Exception $e) {
            // If there's an error, delete the uploaded file if it exists
            if ($coverPath) {
                Storage::disk('public')->delete($coverPath);
            }

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menyimpan buku.')
                ->withInput();
        }
    }

    public function edit($id)
    {
        $book = Buku::findOrFail($id);

        if (!$book) {
            return redirect()->route('buku.index')
                ->with('error', 'Buku tidak ditemukan.');
        }

        return Inertia::render('Buku/Form', [
            'book' => $book,
            'mode' => 'edit',
        ]);
    }

    public function update(Request $request, $id)
    {
        $book = DB::table('buku')->where('id_buku', $id)->first();

        if (!$book) {
            return redirect()->route('buku.index')
                ->with('error', 'Buku tidak ditemukan.');
        }

        // Validate the request
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'tahun_terbit' => 'required|integer|min:1900|max:' . date('Y'),
            'isbn' => 'nullable|string|unique:buku,isbn,' . $id . ',id_buku',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
            'cover' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
            'remove_cover' => 'nullable|boolean', // Flag to remove existing cover
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        // Handle cover upload/removal logic
        $coverPath = $book->cover; // Keep existing cover by default

        // Check if user wants to remove existing cover
        if ($request->has('remove_cover') && $request->remove_cover) {
            // Delete existing cover if exists
            if ($book->cover) {
                Storage::disk('public')->delete($book->cover);
            }
            $coverPath = null; // Set cover to null
        }
        // If new cover is uploaded, replace existing
        elseif ($request->hasFile('cover')) {
            // Delete old cover if exists
            if ($book->cover) {
                Storage::disk('public')->delete($book->cover);
            }
            $coverPath = $request->file('cover')->store('covers', 'public');
        }

        // Update database
        try {
            Buku::where('id_buku', $id)
                ->update([
                    'judul' => $validated['judul'],
                    'penulis' => $validated['penulis'],
                    'penerbit' => $validated['penerbit'],
                    'tahun_terbit' => $validated['tahun_terbit'],
                    'isbn' => $validated['isbn'],
                    'deskripsi' => $validated['deskripsi'],
                    'stok' => $validated['stok'],
                    'cover' => $coverPath,
                    'updated_at' => now(),
                ]);

            return redirect()->route('buku.index')
                ->with('success', 'Buku berhasil diperbarui!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui buku.')
                ->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            $buku = Buku::findOrFail($id);

            // Delete cover file if exists
            if ($buku->cover && Storage::disk('public')->exists($buku->cover)) {
                Storage::disk('public')->delete($buku->cover);
            }

            // Delete the book record
            $buku->delete();

            return redirect()->route('buku.index')
                ->with('success', 'Buku berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus buku.');
        }
    }
}
