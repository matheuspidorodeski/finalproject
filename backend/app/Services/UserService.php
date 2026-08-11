<?php
namespace App\Services;
use App\Models\User;

class UserService {
    public function update(User $user, array $data): User {
        $user->update($data);
        return $user;
    }
    public function search(?string $q) {
        return User::when($q, fn($query) => $query->where('name','like',"%$q%")->orWhere('username','like',"%$q%"))->get();
    }
}