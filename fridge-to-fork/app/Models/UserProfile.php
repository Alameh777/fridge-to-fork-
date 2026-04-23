<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id', 'cultural_background', 'language',
        'is_halal', 'is_vegetarian', 'is_vegan',
        'ramadan_mode', 'allergies', 'avatar',
    ];

    protected $casts = [
        'allergies' => 'array',
        'is_halal' => 'boolean',
        'is_vegetarian' => 'boolean',
        'is_vegan' => 'boolean',
        'ramadan_mode' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
