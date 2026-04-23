<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    protected $fillable = [
        'user_id', 'title', 'title_ar', 'description', 'description_ar',
        'ingredients', 'steps', 'steps_ar', 'prep_time', 'cook_time',
        'servings', 'cuisine', 'image', 'is_halal', 'is_vegetarian',
        'is_vegan', 'is_ramadan_friendly', 'is_ai_generated',
        'is_community', 'tags', 'likes',
        'calories_per_serving', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
    ];

    protected $casts = [
        'ingredients' => 'array',
        'steps' => 'array',
        'steps_ar' => 'array',
        'tags' => 'array',
        'is_halal' => 'boolean',
        'is_vegetarian' => 'boolean',
        'is_vegan' => 'boolean',
        'is_ramadan_friendly' => 'boolean',
        'is_ai_generated' => 'boolean',
        'is_community' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function savedBy()
    {
        return $this->belongsToMany(User::class, 'saved_recipes');
    }
}
