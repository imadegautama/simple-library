<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AnggotaController extends Controller
{
    public function index()
    {
        $anggota = User::where('role', 'anggota')
            ->select('id', 'name', 'email', 'telepon', 'alamat')
            ->get();

        return Inertia::render('Anggota/Index', [
            'anggota' => $anggota,
        ]);
    }

    public function create()
    {
        return Inertia::render('Anggota/Form');
    }

    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telepon' => 'nullable|string|max:15',
            'alamat' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        // Insert into database
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'telepon' => $validated['telepon'],
            'alamat' => $validated['alamat'],
            'role' => 'anggota', // Assuming role is set to anggota
        ]);

        return redirect()->route('anggota.index')->with('success', 'Anggota berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);

        if (!$user || $user->role !== 'anggota') {
            return redirect()->route('anggota.index')
                ->with('error', 'Anggota tidak ditemukan.');
        }

        // Transform data to match frontend expectations
        $anggota = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telepon' => $user->telepon,
            'alamat' => $user->alamat,
        ];

        return Inertia::render('Anggota/Form', [
            'anggota' => $anggota,
            'mode' => 'edit',
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $anggota = User::findOrFail($id);

            // Validate the request
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id,
                'telepon' => 'nullable|string|max:15',
                'alamat' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $validated = $validator->validated();

            // Update the anggota
            $anggota->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'telepon' => $validated['telepon'],
                'alamat' => $validated['alamat'],
            ]);

            return redirect()->route('anggota.index')
                ->with('success', 'Anggota berhasil diperbarui!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui anggota.')
                ->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            $anggota = User::findOrFail($id);

            // Check if user has role anggota to prevent deleting admin users
            if ($anggota->role !== 'anggota') {
                return redirect()->back()
                    ->with('error', 'Tidak dapat menghapus user dengan role selain anggota.');
            }

            // Delete the anggota record
            $anggota->delete();

            return redirect()->route('anggota.index')
                ->with('success', 'Anggota berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus anggota.');
        }
    }
}
