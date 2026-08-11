<?php
namespace App\Http\Controllers\Api;
use OpenApi\Annotations as OA;
use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;

/**
 * @OA\Info(
 *     title="Instagram Clone API",
 *     version="1.0.0"
 * )
 */
class AuthController extends Controller {
    public function __construct(private AuthService $service) {}
    public function register(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);
        return response()->json($this->service->register($data), 201);
    }
    public function login(Request $request) {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required']);
        return response()->json($this->service->login($data));
    }
    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }
}