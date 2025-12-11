document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    // --- 1. DARK MODE LOGIC ---
    const themeBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');

    function applyTheme(isDark) {
        if (isDark) {
            document.body.setAttribute('data-theme', 'dark');
            if(themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            if(themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    // Init Theme
    applyTheme(currentTheme === 'dark');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                localStorage.setItem('theme', 'light');
                applyTheme(false);
            } else {
                localStorage.setItem('theme', 'dark');
                applyTheme(true);
            }
        });
    }

    // --- CREDENTIALS ---
    const OWNER_EMAIL = "zoraaacnl@owner.com";
    const OWNER_PASS = "GHERY0987";

    // --- PAGE: LOGIN ---
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const u = document.getElementById('loginUser').value;
                const p = document.getElementById('loginPass').value;

                // Check Owner
                if (u === OWNER_EMAIL && p === OWNER_PASS) {
                    setSession('Owner', 'owner');
                    return;
                }

                // Check Staff
                const staffs = JSON.parse(localStorage.getItem('db_staffs')) || [];
                const staff = staffs.find(s => s.username === u && s.password === p);
                
                if (staff) {
                    setSession(staff.username, staff.role);
                } else {
                    alert("Akses Ditolak: Username atau Password salah.");
                }
            });
        }
    }

    // --- PAGE: DASHBOARD ---
    if (path.includes('dashboard.html')) {
        const user = sessionStorage.getItem('activeUser');
        const role = sessionStorage.getItem('activeRole');
        
        if (!user) { window.location.href = 'index.html'; return; }

        document.getElementById('displayUser').innerText = user;
        document.getElementById('displayRole').innerText = role.toUpperCase();

        // Role Based UI
        if (role === 'owner') {
            document.getElementById('menuUsers').classList.remove('hidden');
            document.getElementById('cleanExpBtn').classList.remove('hidden');
        }

        // Load Config & Data
        loadServerInfo();
        renderPanels();
        
        // Form: Create Panel (New Format)
        document.getElementById('formCreatePanel').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validasi Input Limits
            const cpu = parseInt(document.getElementById('pCpu').value);
            const ram = parseInt(document.getElementById('pRam').value);
            const disk = parseInt(document.getElementById('pDisk').value);

            if (cpu > 95) { alert("CPU tidak boleh lebih dari 95%!"); return; }
            if (ram > 5000) { alert("RAM tidak boleh lebih dari 5000 MB!"); return; }
            if (disk > 10000) { alert("Disk tidak boleh lebih dari 10000 MB!"); return; }

            const serverConf = JSON.parse(localStorage.getItem('db_server')) || { ip: 'Unset', plta: 'Unset' };
            const panels = JSON.parse(localStorage.getItem('db_panels')) || [];

            panels.push({
                id: Date.now(),
                user: document.getElementById('pUser').value,
                pass: document.getElementById('pPass').value,
                res: { cpu, ram, disk },
                egg: document.getElementById('pEgg').value,
                status: 'Active',
                creator: user,
                nodeIP: serverConf.ip,
                nodePLTA: serverConf.plta
            });

            localStorage.setItem('db_panels', JSON.stringify(panels));
            closeModal('modalCreatePanel');
            renderPanels();
            e.target.reset();
        });

        // Form: Server Config
        document.getElementById('formServerConfig').addEventListener('submit', (e) => {
            e.preventDefault();
            const config = {
                ip: document.getElementById('confIP').value,
                plta: document.getElementById('confPLTA').value
            };
            localStorage.setItem('db_server', JSON.stringify(config));
            alert("Konfigurasi Server Disimpan!");
            loadServerInfo();
        });

        // Form: Create Staff
        document.getElementById('formCreateUser').addEventListener('submit', (e) => {
            e.preventDefault();
            const staffs = JSON.parse(localStorage.getItem('db_staffs')) || [];
            staffs.push({
                id: Date.now(),
                username: document.getElementById('uName').value,
                password: document.getElementById('uPass').value,
                role: document.getElementById('uRole').value
            });
            localStorage.setItem('db_staffs', JSON.stringify(staffs));
            closeModal('modalCreateUser');
            if(!document.getElementById('tab-users').classList.contains('hidden')) renderStaffs();
            e.target.reset();
        });
        
        // Clean Expired Button
        document.getElementById('cleanExpBtn').onclick = () => {
            if(confirm("Hapus semua panel EXPIRED?")) {
                let panels = JSON.parse(localStorage.getItem('db_panels')) || [];
                panels = panels.filter(p => p.status !== 'Expired');
                localStorage.setItem('db_panels', JSON.stringify(panels));
                renderPanels();
            }
        };

        // Logout
        document.getElementById('logoutBtn').onclick = () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        };
    }

    // --- PAGE: CPANEL ---
    if (path.includes('cpanel.html')) {
        const params = new URLSearchParams(window.location.search);
        const pid = params.get('id'); // Get by ID now for accuracy
        const panels = JSON.parse(localStorage.getItem('db_panels')) || [];
        const panel = panels.find(p => p.id == pid);

        if (!panel) { alert("Panel tidak ditemukan"); window.close(); return; }

        if (panel.status === 'Expired') {
            document.getElementById('overlaySuspended').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            return;
        }

        // Fill Data
        document.getElementById('cpUserDisplay').innerText = panel.user;
        document.getElementById('cpIp').innerText = panel.nodeIP || '-';
        document.getElementById('cpUrl').innerText = panel.nodePLTA || '-';
        document.getElementById('cpEgg').innerText = panel.egg;
        document.getElementById('consoleEgg').innerText = panel.egg;
        
        // Resources Text
        document.getElementById('limitCpu').innerText = panel.res.cpu + "%";
        document.getElementById('limitRam').innerText = panel.res.ram + " MB";
        document.getElementById('limitDisk').innerText = panel.res.disk + " MB";
        
        document.title = "Panel - " + panel.user;
    }
});

// --- HELPER FUNCTIONS ---

function setSession(user, role) {
    sessionStorage.setItem('activeUser', user);
    sessionStorage.setItem('activeRole', role);
    window.location.href = 'dashboard.html';
}

function loadServerInfo() {
    const conf = JSON.parse(localStorage.getItem('db_server'));
    if (conf) {
        if(document.getElementById('sidePLTA')) document.getElementById('sidePLTA').innerText = conf.plta || '-';
        if(document.getElementById('sideIP')) document.getElementById('sideIP').innerText = conf.ip || '-';
        
        if(document.getElementById('confIP')) {
            document.getElementById('confIP').value = conf.ip;
            document.getElementById('confPLTA').value = conf.plta;
        }
    }
}

function renderPanels() {
    const tbody = document.getElementById('panelTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const panels = JSON.parse(localStorage.getItem('db_panels')) || [];
    if(panels.length === 0) {
        document.getElementById('emptyPanelMsg').style.display = 'block';
        return;
    }
    document.getElementById('emptyPanelMsg').style.display = 'none';
    
    const role = sessionStorage.getItem('activeRole');

    panels.forEach(p => {
        const badge = p.status === 'Active' ? 'badge-active' : 'badge-expired';
        const link = `cpanel.html?id=${p.id}`; // Gunakan ID agar unik
        let deleteBtn = '';
        
        if (role === 'owner' || role === 'admin') {
            deleteBtn = `<button onclick="deleteData('db_panels', ${p.id})" class="btn btn-danger" style="padding: 5px 10px;"><i class="fa-solid fa-trash"></i></button>`;
        }

        const row = `
            <tr>
                <td><strong>${p.user}</strong></td>
                <td><code>${p.pass}</code></td>
                <td style="font-size:11px;">
                    C:${p.res.cpu}% | R:${p.res.ram}MB | D:${p.res.disk}MB
                </td>
                <td><span class="badge" style="background:var(--border); color:var(--text-main);">${p.egg}</span></td>
                <td><span class="badge ${badge}">${p.status}</span></td>
                <td style="display:flex; gap:5px;">
                    <a href="${link}" target="_blank" class="btn btn-primary" style="padding: 5px 10px;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    ${deleteBtn}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderStaffs() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    const staffs = JSON.parse(localStorage.getItem('db_staffs')) || [];
    
    staffs.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.username}</td>
                <td><code>${s.password}</code></td>
                <td>${s.role}</td>
                <td><button onclick="deleteData('db_staffs', ${s.id})" class="btn btn-danger" style="padding: 5px 10px;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
}

// Global Window Functions (untuk onClick di HTML)
window.switchTab = function(tabName, el) {
    document.querySelectorAll('.tab-content').forEach(d => d.classList.add('hidden'));
    document.getElementById('tab-' + tabName).classList.remove('hidden');
    
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    if(el) el.classList.add('active');
    
    if(tabName === 'users') renderStaffs();
};

window.openModal = (id) => document.getElementById(id).classList.add('show');
window.closeModal = (id) => document.getElementById(id).classList.remove('show');

window.deleteData = (key, id) => {
    if(confirm('Hapus data ini?')) {
        let data = JSON.parse(localStorage.getItem(key)) || [];
        data = data.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(data));
        location.reload();
    }
};

window.onclick = (e) => {
    if(e.target.classList.contains('modal')) e.target.classList.remove('show');
};
