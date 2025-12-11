<?php
// config.php
session_start(); // Memulai sesi di semua halaman yang include config

// 1. KONEKSI CPANEL API
define('CPANEL_HOST', 'domainanda.com'); 
define('CPANEL_USER', 'username_cpanel');
define('CPANEL_TOKEN', 'TOKEN_API_ANDA_DISINI'); 

// 2. DAFTAR USER & ROLE (Tanpa Database)
// Format: 'username' => ['password' => '123', 'role' => 'role_name']
$users = [
    'CARD MARKET' => [
        'password' => 'GHERY0987', 
        'role' => 'owner',
        'name' => 'Super Owner'
    ],
    'admin1' => [
        'password' => 'admin123', 
        'role' => 'admin',
        'name' => 'Administrator'
    ],
    'seller1' => [
        'password' => 'jualan123', 
        'role' => 'reseller',
        'name' => 'Reseller A'
    ]
];
?>
