<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunityPost::with('user:id,name', 'recipe:id,title,title_ar,cuisine')
            ->withCount('comments');

        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->region) {
            $query->where('cultural_region', $request->region);
        }

        $posts = $query->latest()->paginate(20);
        $userId = $request->user()?->id;

        $likedIds = $userId
            ? DB::table('community_post_likes')
                ->where('user_id', $userId)
                ->whereIn('community_post_id', collect($posts->items())->pluck('id'))
                ->pluck('community_post_id')
                ->all()
            : [];

        $items = collect($posts->items())->map(function ($post) use ($likedIds) {
            $post->user_liked = in_array($post->id, $likedIds);
            return $post;
        });

        return response()->json(['posts' => $items]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'            => 'required|in:tip,substitution,post',
            'title'           => 'required|string|max:255',
            'body'            => 'nullable|string',
            'cultural_region' => 'nullable|string',
            'recipe_id'       => 'nullable|exists:recipes,id',
            'image'           => 'nullable|string',
        ]);

        $post = CommunityPost::create(array_merge($validated, [
            'user_id' => $request->user()->id,
        ]));

        $post->user_liked = false;

        return response()->json($post->load('user:id,name', 'recipe:id,title,title_ar,cuisine'), 201);
    }

    public function show(CommunityPost $post)
    {
        return response()->json($post->load('user:id,name', 'recipe:id,title,title_ar,cuisine'));
    }

    public function like(Request $request, CommunityPost $post)
    {
        $userId = $request->user()->id;
        $exists = DB::table('community_post_likes')
            ->where('user_id', $userId)
            ->where('community_post_id', $post->id)
            ->exists();

        if ($exists) {
            DB::table('community_post_likes')
                ->where('user_id', $userId)
                ->where('community_post_id', $post->id)
                ->delete();
            $post->decrement('likes');
            return response()->json(['likes_count' => max(0, $post->fresh()->likes), 'liked' => false]);
        }

        DB::table('community_post_likes')->insert([
            'user_id'            => $userId,
            'community_post_id'  => $post->id,
            'created_at'         => now(),
        ]);
        $post->increment('likes');
        return response()->json(['likes_count' => $post->fresh()->likes, 'liked' => true]);
    }

    public function myPosts(Request $request)
    {
        $posts = CommunityPost::with('recipe:id,title,title_ar')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['posts' => $posts]);
    }

    public function destroy(Request $request, CommunityPost $post)
    {
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }
}
