<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function __construct(private UserService $service)
    {
    }

    public function me(Request $request)
    {
        return $request->user()->load('posts');
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $request->user()->id,
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('avatar')) {

            if ($request->user()->avatar_path) {
                Storage::disk('public')->delete(
                    $request->user()->avatar_path
                );
            }

            $data['avatar_path'] = $request->file('avatar')
                ->store('avatars', 'public');

            unset($data['avatar']);
        }

        return $this->service->update(
            $request->user(),
            $data
        );
    }

    public function search(Request $request)
    {
        return $this->service->search(
            $request->query('q')
        );
    }

    public function show(int $id)
    {
        return User::with('posts')
            ->withCount(['followers', 'following'])
            ->findOrFail($id);
    }
}