<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function __construct(private PostService $service)
    {
    }

    public function index()
    {
        return $this->service->listForFeed();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'caption' => 'nullable|string|max:1000',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        return response()->json(
            $this->service->create(
                $request->user(),
                $data
            ),
            201
        );
    }

    public function show(int $id)
    {
        return \App\Models\Post::with(
            'user',
            'comments',
            'likes'
        )->findOrFail($id);
    }

    public function destroy(Request $request, int $id)
    {
        $this->service->delete(
            $request->user(),
            $id
        );

        return response()->noContent();
    }
}