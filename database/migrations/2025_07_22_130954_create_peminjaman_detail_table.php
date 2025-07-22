<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('peminjaman_detail', function (Blueprint $table) {
            $table->id('id_peminjaman_detail');
            $table->foreignId('id_peminjaman')->constrained('peminjaman', 'id_peminjaman')->onDelete('cascade');
            $table->foreignId('id_buku')->constrained('buku', 'id_buku')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman_detail');
    }
};
