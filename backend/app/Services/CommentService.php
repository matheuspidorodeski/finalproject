<?php
namespace App\Services;
use App\Models\Post;
use App\Models\User;

class CommentService {
    public function create(User $user, int $postId, string $body) {
        $post = Post::findOrFail($postId);
        return $post->comments()->create(['user_id' => $user->id, 'body' => $body]);
    }
    public function list(int $postId) {
        return Post::findOrFail($postId)->comments()->with('user')->get();
    }
}