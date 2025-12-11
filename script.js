document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    // ==========================================
    // 1. LOGIKA HALAMAN LOGIN (index.html)
    // ==========================================
    if (path.includes('index.html') || path === '/') {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const user = document.getElementById('loginUser').value;
                const role = document.getElementById('loginRole').value;

                // Animasi Loading Tombol
                const btn = document.querySelector('.btn-login');
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...';
                
                setTimeout(() => {
                    // Simpan sesi login ke SessionStorage
                    sessionStorage.setItem('activeUser', user);
                    sessionStorage.setItem('activeRole', role);
                    
                    // Redirect ke Dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            });
        }
    }

    // ==========================================
    // 2. LOGIKA DASHBOARD (dashboard.html)
    // ==========================================
    if (path.includes('dashboard.html')) {
        // Cek Login (Security Sederhana)
        const user = sessionStorage.getItem('activeUser');
        const role = sessionStorage.getItem('activeRole');
        
        if (!user) {
            alert("Anda harus login dahulu!");
            window.location.href = 'index.html';
            return;
        }

        // Tampilkan Info User
        document.getElementById('displayUser').innerText = user;
        document.getElementById('displayRole').innerText = role.toUpperCase();
        
        // Logout
        document.getElementById('logoutBtn').onclick = () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        };

        // Load Data Panel
        loadPanels();

        // Modal Logic
        const modal = document.getElementById('createModal');
        document.getElementById('openModalBtn').onclick = () => modal.style.display = "block";
        document.querySelector('.close-btn').onclick = () => modal.style.display = "none";

        // Create Panel Logic
        document.getElementById('createPanelForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const newPanel = {
                id: Date.now(),
                domain: document.getElementById('domainInput').value,
                username: document.getElementById('usernameInput').value,
                package: document.getElementById('packageInput').value,
                role: role // Panel ini dibuat oleh siapa
            };
            
            let panels = JSON.parse(localStorage.getItem('myPanels')) || [];
            panels.push(newPanel);
            localStorage.setItem('myPanels', JSON.stringify(panels));
            
            modal.style.display = "none";
            this.reset();
            loadPanels();
        });
    }

    // ==========================================
    // 3. LOGIKA CPANEL CLIENT (cpanel.html)
    // ==========================================
    if (path.includes('cpanel.html')) {
        // Ambil Data dari URL Parameters
        const params = new URLSearchParams(window.location.search);
        const domain = params.get('domain');
        const user = params.get('user');

        if (!domain) {
            alert("Akses Ilegal! Tidak ada domain dipilih.");
            window.close();
        }

        // Tampilkan Data Dinamis
        document.getElementById('cpUser').innerText = user || 'unknown';
        document.getElementById('cpUserSidebar').innerText = user || 'unknown';
        document.getElementById('cpDomain').innerText = domain;
        document.getElementById('cpHome').innerText = user || 'user';
        
        // Update Title Browser
        document.title = "cPanel - " + domain;
    }
});

// ==========================================
// FUNGSI UMUM (Helper Functions)
// ==========================================
function loadPanels() {
    const tableBody = document.getElementById('panelTableBody');
    if (!tableBody) return;

    let panels = JSON.parse(localStorage.getItem('myPanels')) || [];
    tableBody.innerHTML = '';

    if (panels.length > 0) {
        document.getElementById('emptyMsg').style.display = 'none';
        panels.forEach(panel => {
            // URL MAGIC: Kita kirim data lewat URL
            const cpanelLink = `cpanel.html?domain=${panel.domain}&user=${panel.username}`;

            const row = `
                <tr>
                    <td><b>${panel.domain}</b></td>
                    <td>${panel.username}</td>
                    <td><span class="badge">${panel.package}</span></td>
                    <td>${panel.role}</td>
                    <td>
                        <a href="${cpanelLink}" target="_blank" class="btn-connect">
                           <i class="fa-brands fa-cpanel"></i> Login cPanel
                        </a>
                        <button onclick="deletePanel(${panel.id})" style="color:red; border:none; background:none; cursor:pointer; margin-left:10px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } else {
        document.getElementById('emptyMsg').style.display = 'block';
    }
}

window.deletePanel = function(id) {
    if(confirm('Hapus panel ini?')) {
        let panels = JSON.parse(localStorage.getItem('myPanels')) || [];
        panels = panels.filter(p => p.id !== id);
        localStorage.setItem('myPanels', JSON.stringify(panels));
        loadPanels();
    }
};
