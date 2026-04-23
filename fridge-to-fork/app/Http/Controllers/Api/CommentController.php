<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Models\PostComment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(CommunityPost $post)
    {
        $comments = $post->comments()
            ->with('user:id,name')
            ->oldest()
            ->get();

        return response()->json(['comments' => $comments]);
    }

    public function store(Request $request, CommunityPost $post)
    {
        $request->validate(['body' => 'required|string|max:500']);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'body'    => $request->body,
        ]);

        return response()->json($comment->load('user:id,name'), 201);
    }

    public function destroy(Request $request, CommunityPost $post, PostComment $comment)
    {
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $comment->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
