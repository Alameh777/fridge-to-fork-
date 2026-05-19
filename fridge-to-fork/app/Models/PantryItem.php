<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PantryItem extends Model
{
    protected $fillable = [
        'user_id', 'name', 'quantity', 'unit',
        'expiry_date', 'barcode', 'brand', 'calories_per_100g',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'quantity' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getDaysUntilExpiryAttribute(): ?int
    {
        if (!$this->expiry_date) return null;
        return now()->startOfDay()->diffInDays($this->expiry_date->startOfDay(), false);
    }
}
