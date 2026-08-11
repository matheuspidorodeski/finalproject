<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\LikeService;
use Illuminate\Http\Request;

class LikeController extends Controller {
    public function __construct(private LikeService $service) {}
    public function toggle(Request $request, int $postId) {
        return response()->json(['liked' => $this->service->toggle($request->user(), $postId)]);
    }
}