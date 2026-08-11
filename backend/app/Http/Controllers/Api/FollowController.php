<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\FollowService;
use Illuminate\Http\Request;

class FollowController extends Controller {
    public function __construct(private FollowService $service) {}
    public function store(Request $request, int $userId) {
        $this->service->follow($request->user(), $userId);
        return response()->noContent();
    }
    public function destroy(Request $request, int $userId) {
        $this->service->unfollow($request->user(), $userId);
        return response()->noContent();
    }
}