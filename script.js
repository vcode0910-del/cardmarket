document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    // --- KONFIGURASI OWNER ---
    const OWNER_CREDENTIALS = {
        email: "zoraaacnl@owner.com",
        password: "GHERY0987"
    };

    // ==========================================
    // 1. LOGIKA HALAMAN LOGIN
    // ==========================================
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const userIn = document.getElementById('loginUser').value;
                const passIn = document.getElementById('loginPass').value;
                let role = '';
                let username = '';

                // A. Cek Owner
                if (userIn === OWNER_CREDENTIALS.email && passIn === OWNER_CREDENTIALS.password) {
                    role = 'owner';
                    username = 'Owner';
                } 
                // B. Cek Staff (Admin/Reseller) di Database Lokal
                else {
                    const staffList = JSON.parse(localStorage.getItem('myStaff')) || [];
                    const foundStaff = staffList.find(s => s.username === userIn && s.password === passIn);
                    
                    if (foundStaff) {
                        role = foundStaff.role;
                        username = foundStaff.username;
                    } else {
                        // Gagal
                        const btn = document.querySelector('.btn-login');
                        btn.style.background = '#e74c3c';
                        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> AKSES DITOLAK';
                        setTimeout(() => {
                            btn.style.background = ''; // reset
                            btn.innerHTML = '<span>MASUK SYSTEM</span><i class="fa-solid fa-arrow-right"></i>';
                        }, 2000);
                        return;
                    }
                }

                // Login Berhasil -> Simpan Sesi
                sessionStorage.setItem('activeUser', username);
                sessionStorage.setItem('activeRole', role);
                
                // Redirect
                window.location.href = 'dashboard.html';
            });
        }
    }

    // ==========================================
    // 2. LOGIKA DASHBOARD
    // ==========================================
    if (path.includes('dashboard.html')) {
        const user = sessionStorage.getItem('activeUser');
        const role = sessionStorage.getItem('activeRole');

        // Proteksi jika belum login
        if (!user || !role) { window.location.href = 'index.html'; return; }

        // Tampilkan Info User di Header
        document.getElementById('displayUser').innerText = user;
        document.getElementById('displayRole').innerText = role.toUpperCase();

        // Fitur Khusus OWNER
        if (role === 'owner') {
            document.getElementById('ownerMenu').style.display = 'block'; // Menu Kelola Staff
            document.getElementById('cleanExpBtn').style.display = 'flex'; // Tombol Hapus Expired
        }

        // Render Data Awal
        renderPanels(role);
        
        // --- EVENT LISTENER MODALS & BUTTONS ---

        // 1. Buat Panel Baru
        document.getElementById('openPanelModal').onclick = () => showModal('panelModal');
        document.getElementById('createPanelForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const panels = JSON.parse(localStorage.getItem('myPanels')) || [];
            
            panels.push({
                id: Date.now(),
                domain: document.getElementById('pDomain').value,
                username: document.getElementById('pUser').value,
                status: document.getElementById('pStatus').value,
                creator: role + ` (${user})`
            });

            localStorage.setItem('myPanels', JSON.stringify(panels));
            closeModal('panelModal');
            renderPanels(role);
            this.reset();
        });

        // 2. Buat Staff Baru (Owner Only)
        if (role === 'owner') {
            document.getElementById('openUserModal').onclick = () => showModal('userModal');
            document.getElementById('createUserForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const staff = JSON.parse(localStorage.getItem('myStaff')) || [];
                
                staff.push({
                    id: Date.now(),
                    username: document.getElementById('uName').value,
                    password: document.getElementById('uPass').value,
                    role: document.getElementById('uRole').value
                });

                localStorage.setItem('myStaff', JSON.stringify(staff));
                closeModal('userModal');
                renderStaff();
                this.reset();
            });
            
            // Hapus Panel Expired (Owner Only)
            document.getElementById('cleanExpBtn').onclick = function() {
                if(confirm('PERINGATAN: Semua panel berstatus EXPIRED akan dihapus permanen. Lanjutkan?')) {
                    let panels = JSON.parse(localStorage.getItem('myPanels')) || [];
                    const initialCount = panels.length;
                    panels = panels.filter(p => p.status !== 'Expired');
                    
                    localStorage.setItem('myPanels', JSON.stringify(panels));
                    renderPanels(role);
                    alert(`Berhasil membersihkan ${initialCount - panels.length} panel expired.`);
                }
            };
        }

        // Logout
        document.getElementById('logoutBtn').onclick = () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        };
    }

    // ==========================================
    // 3. LOGIKA CPANEL (USER VIEW)
    // ==========================================
    if (path.includes('cpanel.html')) {
        const params = new URLSearchParams(window.location.search);
        const domain = params.get('domain');

        // Ambil Database Panel
        const panels = JSON.parse(localStorage.getItem('myPanels')) || [];
        const activePanel = panels.find(p => p.domain === domain);

        if (!activePanel) {
            alert("Panel tidak valid atau sudah dihapus!");
            window.close();
            return;
        }

        // --- SISTEM PENGHAPUSAN / BLOKIR EXPIRED ---
        if (activePanel.status === 'Expired') {
            // Tampilkan Overlay Blokir (Seolah-olah website terhapus/suspended)
            const overlay = document.getElementById('suspendedOverlay');
            overlay.style.display = 'flex'; // Flex agar di tengah
            document.title = "ACCOUNT SUSPENDED";
            
            // Nonaktifkan scroll
            document.body.style.overflow = 'hidden'; 
            return; // Hentikan eksekusi script selanjutnya
        }

        // Jika Active, tampilkan data
        document.getElementById('cpUser').innerText = activePanel.username;
        document.getElementById('cpUserSide').innerText = activePanel.username;
        document.getElementById('cpDomain').innerText = activePanel.domain;
        document.getElementById('cpHome').innerText = activePanel.username;
        document.title = "cPanel - " + activePanel.domain;
    }
});

// ================= FUNGSI HELPER =================

function renderPanels(role) {
    const tbody = document.getElementById('panelTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let panels = JSON.parse(localStorage.getItem('myPanels')) || [];
    
    if (panels.length === 0) {
        document.getElementById('emptyMsgPanel').style.display = 'block';
        return;
    }
    document.getElementById('emptyMsgPanel').style.display = 'none';

    panels.forEach(p => {
        // Style Badge
        const badgeClass = p.status === 'Active' ? 'badge-active' : 'badge-expired';
        
        // Link Login cPanel
        const cpanelLink = `cpanel.html?domain=${p.domain}&user=${p.username}`;
        
        // Tombol Hapus (Owner/Admin)
        let deleteBtn = '';
        if (role === 'owner' || role === 'admin') {
            deleteBtn = `<button onclick="deleteItem('myPanels', ${p.id})" class="btn-logout" style="color:red; border-color:red;" title="Hapus"><i class="fa-solid fa-trash"></i></button>`;
        }

        const row = `
            <tr>
                <td><strong>${p.domain}</strong></td>
                <td>${p.username}</td>
                <td><span class="${badgeClass}">${p.status}</span></td>
                <td style="font-size:12px; color:#777;">${p.creator || '-'}</td>
                <td style="display:flex; gap:5px;">
                    <a href="${cpanelLink}" target="_blank" class="btn-logout" style="color:#3498db; border-color:#3498db; text-decoration:none; display:inline-block;" title="Login cPanel"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    ${deleteBtn}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderStaff() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let staff = JSON.parse(localStorage.getItem('myStaff')) || [];
    
    if (staff.length === 0) {
        document.getElementById('emptyMsgUser').style.display = 'block';
        return;
    }
    document.getElementById('emptyMsgUser').style.display = 'none';

    staff.forEach(s => {
        const row = `
            <tr>
                <td>${s.username}</td>
                <td><span class="role-badge" style="background:#333; color:white;">${s.role}</span></td>
                <td><code>${s.password}</code></td>
                <td><button onclick="deleteItem('myStaff', ${s.id})" class="btn-logout" style="color:red; border-color:red;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Fungsi Hapus Universal
window.deleteItem = function(key, id) {
    if(confirm('Yakin ingin menghapus data ini?')) {
        let items = JSON.parse(localStorage.getItem(key)) || [];
        items = items.filter(i => i.id !== id);
        localStorage.setItem(key, JSON.stringify(items));
        location.reload(); 
    }
};

// Navigasi Tab
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById('section-' + tabName).style.display = 'block';
    
    document.querySelectorAll('.menu-list a').forEach(a => a.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    
    if(tabName === 'users') renderStaff();
};

// Modal
window.showModal = (id) => document.getElementById(id).style.display = 'block';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
};
