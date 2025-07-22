<?php

use App\Http\Controllers\AnggotaController;
use App\Http\Controllers\AnggotaDashboardController;
use App\Http\Controllers\BukuController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PeminjamanController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard route dengan logic role-based
    Route::get('/dashboard', function () {
        if (Auth::user() && Auth::user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } else {
            return redirect()->route('anggota.dashboard');
        }
    })->middleware('auth')->name('dashboard');

    Route::get('/admin/dashboard', [DashboardController::class, 'index'])
        ->middleware(['auth', 'admin'])
        ->name('admin.dashboard');

    Route::get('/anggota/dashboard', [AnggotaDashboardController::class, 'index'])
        ->middleware('auth')
        ->name('anggota.dashboard');    // Routes khusus untuk Admin
    Route::middleware(['admin'])->group(function () {
        Route::resource('buku', BukuController::class);
        Route::resource('anggota', AnggotaController::class);
        Route::resource('peminjaman', PeminjamanController::class);
        Route::post('peminjaman/{peminjaman}/return', [PeminjamanController::class, 'returnBook'])->name('peminjaman.return');
    });

    // Routes untuk Anggota (jika ada yang spesifik untuk anggota)
    // Route::middleware(['anggota'])->group(function () {
    //     // Routes khusus anggota bisa ditambah disini
    // });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
