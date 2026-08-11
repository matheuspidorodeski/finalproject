<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function listForFeed()
    {
        return Post::with(
            'user',
            'comments',
            'likes'
        )
        ->latest()
        ->get();
    }

    public function create(User $author, array $data): Post
    {
        $imagem = $data['image'];

        $caminho = $imagem->store(
            'posts',
            'public'
        );

        return Post::create([
            'user_id' => $author->id,
            'caption' => $data['caption'] ?? null,
            'image_path' => $caminho,
        ]);
    }

    public function delete(User $requester, int $id): void
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== $requester->id) {
            throw new \Exception(
                'Sem permissão',
                403
            );
        }

        if ($post->image_path) {
            Storage::disk('public')->delete(
                $post->image_path
            );
        }

        $post->delete();
    }
}