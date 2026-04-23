<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Models\PostComment;
use App\Models\Recipe;
use App\Models\User;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'users'       => User::count(),
            'posts'       => CommunityPost::count(),
            'recipes'     => Recipe::count(),
            'total_likes' => CommunityPost::sum('likes'),
        ]);
    }

    public function users()
    {
        $users = User::withCount('communityPosts')
            ->latest()
            ->get(['id', 'name', 'email', 'is_admin', 'created_at']);

        return response()->json(['users' => $users]);
    }

    public function deleteUser(User $user)
    {
        if ($user->is_admin) {
            return response()->json(['message' => 'Cannot delete admin users'], 403);
        }
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function posts()
    {
        $posts = CommunityPost::with('user:id,name')
            ->withCount('comments')
            ->latest()
            ->get(['id', 'user_id', 'body', 'image', 'likes', 'created_at']);

        return response()->json(['posts' => $posts]);
    }

    public function postComments(CommunityPost $post)
    {
        $comments = $post->comments()
            ->with('user:id,name')
            ->oldest()
            ->get();

        return response()->json(['comments' => $comments]);
    }

    public function deletePost(CommunityPost $post)
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    public function deleteComment(PostComment $comment)
    {
        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
