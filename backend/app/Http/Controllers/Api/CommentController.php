<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\CommentService;
use Illuminate\Http\Request;

class CommentController extends Controller {
    public function __construct(private CommentService $service) {}
    public function index(int $postId) { return $this->service->list($postId); }
    public function store(Request $request, int $postId) {
        $data = $request->validate(['body' => 'required|string']);
        return response()->json($this->service->create($request->user(), $postId, $data['body']), 201);
    }
}