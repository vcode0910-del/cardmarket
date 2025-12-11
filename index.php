<?php
// index.php
session_start();

// Simulasi data user
$username = "user_demo";
$domain = "website-saya.com";
$ip_address = "192.168.1.100";

// Array fitur untuk ditampilkan (Simulasi fitur cPanel)
$features = [
    "Files" => [
        ["icon" => "fa-folder", "name" => "File Manager"],
        ["icon" => "fa-image", "name" => "Images"],
        ["icon" => "fa-hdd", "name" => "Disk Usage"],
        ["icon" => "fa-user-lock", "name" => "Directory Privacy"],
    ],
    "Databases" => [
        ["icon" => "fa-database", "name" => "phpMyAdmin"],
        ["icon" => "fa-server", "name" => "MySQL Databases"],
        ["icon" => "fa-magic", "name" => "MySQL Wizard"],
    ],
    "Domains" => [
        ["icon" => "fa-globe", "name" => "Site Publisher"],
        ["icon" => "fa-link", "name" => "Domains"],
        ["icon" => "fa-random", "name" => "Redirects"],
    ],
    "Email" => [
        ["icon" => "fa-envelope", "name" => "Email Accounts"],
        ["icon" => "fa-share", "name" => "Forwarders"],
        ["icon" => "fa-filter", "name" => "Spam Filters"],
    ]
];
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control Panel - <?php echo $domain; ?></title>
    <!-- Menggunakan Font Awesome untuk Ikon -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Header / Top Bar -->
    <header>
        <div class="logo">
            <i class="fa-brands fa-cpanel fa-2x"></i> <span>MyHostingPanel</span>
        </div>
        <div class="user-info">
            <span><i class="fa-user"></i> <?php echo $username; ?></span>
            <a href="#" class="logout-btn">Logout</a>
        </div>
    </header>

    <div class="container">
        <!-- Sidebar Kanan (Informasi Server) -->
        <aside class="sidebar">
            <div class="info-box">
                <h3>GENERAL INFORMATION</h3>
                <ul>
                    <li><strong>User:</strong> <?php echo $username; ?></li>
                    <li><strong>Domain:</strong> <?php echo $domain; ?></li>
                    <li><strong>IP Address:</strong> <?php echo $ip_address; ?></li>
                    <li><strong>Home Dir:</strong> /home/<?php echo $username; ?></li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>STATISTICS</h3>
                <div class="stat-item">
                    <span>Disk Usage</span>
                    <div class="progress-bar"><div class="fill" style="width: 45%;"></div></div>
                    <small>450 MB / 1 GB</small>
                </div>
                <div class="stat-item">
                    <span>Bandwidth</span>
                    <div class="progress-bar"><div class="fill" style="width: 20%;"></div></div>
                    <small>2 GB / 10 GB</small>
                </div>
            </div>
        </aside>

        <!-- Area Konten Utama -->
        <main class="main-content">
            <!-- Kolom Pencarian -->
            <div class="search-bar">
                <i class="fa-search"></i>
                <input type="text" id="searchInput" placeholder="Cari fitur (misal: email, database)...">
            </div>

            <!-- Loop Kategori dan Fitur -->
            <?php foreach ($features as $category => $items): ?>
                <div class="section-group">
                    <h2 class="section-title"><?php echo $category; ?></h2>
                    <div class="grid-container">
                        <?php foreach ($items as $item): ?>
                            <div class="grid-item">
                                <a href="#">
                                    <i class="fas <?php echo $item['icon']; ?>"></i>
                                    <span class="item-name"><?php echo $item['name']; ?></span>
                                </a>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
