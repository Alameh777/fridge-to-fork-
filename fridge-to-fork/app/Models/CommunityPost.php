<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityPost extends Model
{
    protected $fillable = [
        'user_id', 'recipe_id', 'type', 'title',
        'body', 'cultural_region', 'image', 'likes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'community_post_likes')->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(PostComment::class, 'community_post_id');
    }
}
