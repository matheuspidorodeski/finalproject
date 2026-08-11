<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;

class LikeService
{
    public function toggle(User $user, int $postId): bool
    {
        $post = Post::findOrFail($postId);

        if ($post->isLikedBy($user)) {
            $post->likes()->where('user_id', $user->id)->delete();
            return false;
        }

        $post->likes()->create(['user_id' => $user->id]);
        return true;
    }
}