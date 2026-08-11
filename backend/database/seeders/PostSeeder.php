<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            Post::create([
                'user_id' => $user->id,
                'caption' => 'Meu primeiro post por aqui!',
                'image_path' => 'https://picsum.photos/500?random=' . $user->id,
            ]);
        }
    }
}