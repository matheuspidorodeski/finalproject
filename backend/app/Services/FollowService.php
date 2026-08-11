<?php
namespace App\Services;
use App\Models\User;

class FollowService {
    public function follow(User $me, int $targetId): void {
        if ($me->id === $targetId) throw new \Exception('Não pode seguir a si mesmo', 422);
        $me->following()->syncWithoutDetaching([$targetId]);
    }
    public function unfollow(User $me, int $targetId): void {
        $me->following()->detach($targetId);
    }
}