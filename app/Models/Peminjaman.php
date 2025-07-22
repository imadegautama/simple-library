<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peminjaman extends Model
{
    protected $table = 'peminjaman';
    protected $primaryKey = 'id_peminjaman';
    protected $guarded = ['id_peminjaman'];

    /**
     * Get the user who created the peminjaman.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who borrowed the book.
     */
    public function anggota()
    {
        return $this->belongsTo(User::class, 'id_anggota');
    }

    /**
     * Get the peminjaman details.
     */
    public function peminjamanDetails()
    {
        return $this->hasMany(PeminjamanDetail::class, 'id_peminjaman', 'id_peminjaman');
    }
}
