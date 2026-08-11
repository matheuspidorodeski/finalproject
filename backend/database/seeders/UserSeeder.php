<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Maria Silva',
            'username' => 'mariasilva',
            'email' => 'maria@teste.com',
            'password' => '123456',
            'bio' => 'Fotógrafa e viajante',
        ]);

        User::create([
            'name' => 'João Souza',
            'username' => 'joaosouza',
            'email' => 'joao@teste.com',
            'password' => '123456',
            'bio' => 'Amante de café',
        ]);

        User::create([
            'name' => 'Ana Costa',
            'username' => 'anacosta',
            'email' => 'ana@teste.com',
            'password' => '123456',
            'bio' => 'Designer gráfica',
        ]);
    }
}