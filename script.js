document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    // --- CREDENTIALS OWNER ---
    const OWNER_CREDENTIALS = {
        email: "zoraaacnl@owner.com",
        password: "GHERY0987"
    };

    // ==========================================
    // 1. HALAMAN LOGIN
    // ==========================================
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const userIn = document.getElementById('loginUser').value;
                const passIn = document.getElementById('loginPass').value;
                
                // Cek Owner
                if (userIn === OWNER_CREDENTIALS.email && passIn === OWNER_CREDENTIALS.password) {
                    sessionStorage.setItem('activeUser', 'Owner');
                    sessionStorage.setItem('activeRole', 'owner');
                    window.location.href = 'dashboard.html';
                    return;
                }

                // Cek Staff (Local Storage)
                const staffList = JSON.parse(localStorage.getItem('myStaff')) || [];
                const foundStaff = staffList.find(s => s.username === userIn && s.password === passIn);
                
                if (foundStaff) {
                    sessionStorage.setItem('activeUser', foundStaff.username);
                    sessionStorage.setItem('activeRole', foundStaff.role);
                    window.location.href = 'dashboard.html';
                } else {
                    const btn = document.querySelector('.btn-login');
                    btn.innerHTML = 'AKSES DITOLAK';
                    btn.style.background = '#e74c3c';
                    setTimeout(() => {
                        btn.innerHTML = '<span>MASUK SYSTEM</span><i class="fa-solid fa-arrow-right"></i>';
                        btn.style.background = '';
                    }, 2000);
                }
            });
        }
    }

    // ==========================================
    // 2. DASHBOARD
    // ==========================================
    if (path.includes('dashboard.html')) {
        const user = sessionStorage.getItem('activeUser');
        const role = sessionStorage.getItem('activeRole');
        
        if (!user || !role) { window.location.href = 'index.html'; return; }

        document.getElementById('displayUser').innerText = user;
        document.getElementById('displayRole').innerText = role.toUpperCase();

        if (role === 'owner') {
            document.getElementById('ownerMenu').style.display = 'block';
            document.getElementById('cleanExpBtn').style.display = 'flex';
        }

        loadServerConfig();
        renderPanels(role);

        // --- Create Panel ---
        document.getElementById('openPanelModal').onclick = () => showModal('panelModal');
        document.getElementById('createPanelForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ambil Config Server Aktif
            const serverConfig = JSON.parse(localStorage.getItem('serverConfig')) || { ip: '127.0.0.1', domain: 'localhost' };

            const panels = JSON.parse(localStorage.getItem('myPanels')) || [];
            panels.push({
                id: Date.now(),
                domain: document.getElementById('pDomain').value,
                username: document.getElementById('pUser').value,
                status: document.getElementById('pStatus').value,
                creator: role + ` (${user})`,
                connectedIP: serverConfig.ip,
                connectedDomain: serverConfig.domain
            });

            localStorage.setItem('myPanels', JSON.stringify(panels));
            closeModal('panelModal');
            renderPanels(role);
            this.reset();
        });

        // --- Save Server Config ---
        const serverForm = document.getElementById('serverConfigForm');
        if(serverForm) {
            serverForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const config = {
                    ip: document.getElementById('confIP').value,
                    domain: document.getElementById('confDomain').value
                };
                localStorage.setItem('serverConfig', JSON.stringify(config));
                alert("Koneksi Server Berhasil Disimpan!");
                loadServerConfig();
            });
        }

        // --- Owner Features (Staff & Clean) ---
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

            document.getElementById('cleanExpBtn').onclick = function() {
                if(confirm('Hapus SEMUA panel expired secara permanen?')) {
                    let panels = JSON.parse(localStorage.getItem('myPanels')) || [];
                    panels = panels.filter(p => p.status !== 'Expired');
                    localStorage.setItem('myPanels', JSON.stringify(panels));
                    renderPanels(role);
                }
            };
        }

        document.getElementById('logoutBtn').onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };
    }

    // ==========================================
    // 3. CPANEL PAGE
    // ==========================================
    if (path.includes('cpanel.html')) {
        const params = new URLSearchParams(window.location.search);
        const domain = params.get('domain');

        const panels = JSON.parse(localStorage.getItem('myPanels')) || [];
        const activePanel = panels.find(p => p.domain === domain);

        if (!activePanel) {
            alert("Panel tidak valid!");
            window.close();
            return;
        }

        // Cek Status Expired
        if (activePanel.status === 'Expired') {
            document.getElementById('suspendedOverlay').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            return;
        }

        // Tampilkan Data
        document.getElementById('cpUser').innerText = activePanel.username;
        document.getElementById('cpUserSide').innerText = activePanel.username;
        document.getElementById('cpDomain').innerText = activePanel.domain;
        document.getElementById('cpHome').innerText = activePanel.username;
        document.getElementById('cpIP').innerText = activePanel.connectedIP || 'Unknown';
        document.getElementById('cpPanelUrl').innerText = activePanel.connectedDomain || 'Localhost';
        document.title = "cPanel - " + activePanel.domain;
    }
});

// --- HELPER FUNCTIONS ---

function loadServerConfig() {
    const config = JSON.parse(localStorage.getItem('serverConfig'));
    const statusPill = document.getElementById('serverStatusDisplay');
    const sideIP = document.getElementById('sidebarIP');
    const sideDom = document.getElementById('sidebarDomain');

    if (config && config.ip) {
        if(document.getElementById('confIP')) document.getElementById('confIP').value = config.ip;
        if(document.getElementById('confDomain')) document.getElementById('confDomain').value = config.domain;
        if(statusPill) {
            statusPill.innerHTML = `<i class="fa-solid fa-link"></i> Connected: ${config.ip}`;
            statusPill.className = 'server-status-pill online';
        }
        if(sideIP) sideIP.innerText = config.ip;
        if(sideDom) sideDom.innerText = config.domain;
    }
}

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
        const badgeClass = p.status === 'Active' ? 'badge-active' : 'badge-expired';
        const cpanelLink = `cpanel.html?domain=${p.domain}`;
        let deleteBtn = '';
        
        if (role === 'owner' || role === 'admin') {
            deleteBtn = `<button onclick="deleteItem('myPanels', ${p.id})" class="btn-logout" style="color:red; border-color:red;"><i class="fa-solid fa-trash"></i></button>`;
        }

        const row = `
            <tr>
                <td><strong>${p.domain}</strong></td>
                <td>${p.username}</td>
                <td><small>${p.connectedIP || '-'}</small></td>
                <td><span class="${badgeClass}">${p.status}</span></td>
                <td style="display:flex; gap:5px;">
                    <a href="${cpanelLink}" target="_blank" class="btn-logout" style="color:#3498db; border-color:#3498db;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
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
    if (staff.length === 0) { document.getElementById('emptyMsgUser').style.display = 'block'; return; }
    document.getElementById('emptyMsgUser').style.display = 'none';

    staff.forEach(s => {
        const row = `<tr><td>${s.username}</td><td>${s.role}</td><td>${s.password}</td><td><button onclick="deleteItem('myStaff', ${s.id})" style="color:red; border:none; background:none; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        tbody.innerHTML += row;
    });
}

window.deleteItem = function(key, id) {
    if(confirm('Hapus item ini?')) {
        let items = JSON.parse(localStorage.getItem(key)) || [];
        items = items.filter(i => i.id !== id);
        localStorage.setItem(key, JSON.stringify(items));
        location.reload(); 
    }
};

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById('section-' + tabName).style.display = 'block';
    document.querySelectorAll('.menu-list a').forEach(a => a.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    if(tabName === 'users') renderStaff();
};

window.showModal = (id) => document.getElementById(id).style.display = 'block';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
