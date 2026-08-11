<?php
namespace App\Services;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService {
    public function register(array $data): array {
        $user = User::create($data);
        return ['user' => $user, 'token' => $user->createToken('app')->plainTextToken];
    }
    public function login(array $credentials): array {
        $user = User::where('email', $credentials['email'])->first();
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new \Exception('Credenciais inválidas', 401);
        }
        return ['user' => $user, 'token' => $user->createToken('app')->plainTextToken];
    }
}
