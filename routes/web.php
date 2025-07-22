<?php

use App\Http\Controllers\AnggotaController;
use App\Http\Controllers\BukuController;
use App\Http\Controllers\PeminjamanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('buku', BukuController::class);
    Route::resource('anggota', AnggotaController::class);
    Route::resource('peminjaman', PeminjamanController::class);
    Route::post('peminjaman/{peminjaman}/return', [PeminjamanController::class, 'returnBook'])->name('peminjaman.return');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
