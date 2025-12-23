// 1. KONFIGURASI & URL DATABASE (Ganti sesuai URL Deployment Apps Script lu)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwKC5A1cnwSwydCFQYmkuRak4DE5GeW0YTUZCukOVzEXPBvXUYbiJJxQtywJlWh5eD8/exec";

document.addEventListener('DOMContentLoaded', () => {
    const namaUser = localStorage.getItem('namaLengkap') || 'Member';
    const bioUser = localStorage.getItem('userBio') || ''; // Ambil bio
    
    document.getElementById('display-name').innerText = "Halo, " + namaUser;
    
    // Jika ada elemen bio di dashboard (opsional), tampilkan juga
    const bioDisplay = document.getElementById('display-bio');
    if(bioDisplay) bioDisplay.innerText = bioUser;

    setTimeout(() => {
        showAlert("Selamat datang di Dashboard Kelas, " + namaUser + "!", "success");
    }, 500);
});

// 2. FUNGSI DROPDOWN & MENU
function toggleMenu() {
    document.getElementById('dropdown-menu').classList.toggle('active');
}

// Tutup menu kalau klik di luar area settings
window.onclick = function(event) {
    if (!event.target.matches('.settings-btn')) {
        const dropdown = document.getElementById('dropdown-menu');
        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    }
}

// 3. FITUR EDIT PROFIL (LOCAL STORAGE)
function openEditProfile() {
    const currentName = localStorage.getItem('namaLengkap');
    const currentBio = localStorage.getItem('userBio') || '';
    
    document.getElementById('edit-name').value = currentName;
    document.getElementById('edit-bio').value = currentBio;
    document.getElementById('edit-profile-modal').classList.remove('hidden');
}

function closeEditProfile() {
    document.getElementById('edit-profile-modal').classList.add('hidden');
}

async function saveProfile() {
    const usernameAsli = localStorage.getItem('usernameAsli');
    const newDisplayName = document.getElementById('edit-name').value;
    const newBio = document.getElementById('edit-bio').value;

    closeEditProfile();
    showAlert("Menyimpan ke database...", "info");

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateProfile',
                usernameAsli: usernameAsli,
                newDisplayName: newDisplayName,
                newBio: newBio
            })
        });
        const result = await response.json();
        if (result.success) {
            // Update Local Storage
            localStorage.setItem('namaLengkap', newDisplayName);
            localStorage.setItem('userBio', newBio);
            
            // Update UI Langsung
            document.getElementById('display-name').innerText = "Halo, " + newDisplayName;
            
            showAlert("Berhasil diupdate!", "success");
        }
    } catch (e) { 
        showAlert("Gagal koneksi", "error"); 
    }
}

// 4. FITUR PENCARIAN TEMAN DARI DATABASE
async function searchUser() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const dropdown = document.getElementById('search-results-dropdown');
    
    if (keyword.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`${WEB_APP_URL}?action=getUsers`);
        const result = await response.json();

        if (result.success) {
            const filtered = result.users.filter(u => u.nama.toLowerCase().includes(keyword));
            dropdown.innerHTML = '';

            if (filtered.length > 0) {
                dropdown.classList.remove('hidden');
                filtered.forEach(user => {
                    const userData = JSON.stringify(user).replace(/"/g, '&quot;');
                    dropdown.innerHTML += `
                        <div class="search-item" onclick="viewProfile('${userData}')">
                            <h5>${user.nama}</h5>
                            <span>${user.role}</span>
                        </div>
                    `;
                });
            } else {
                dropdown.innerHTML = '<div class="search-item"><span>Tidak ditemukan</span></div>';
            }
        }
    } catch (err) {
        console.error("Error search:", err);
    }
}

// Tambahkan ini biar dropdown tertutup kalau klik di mana aja
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search')) {
        document.getElementById('search-results-dropdown').classList.add('hidden');
    }
});

// 5. FUNGSI MUSIK (DENGAN FADE IN)
function toggleMusic() {
    const music = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    const musicStatus = document.getElementById('music-status');

    if (music.paused) {
        music.volume = 0; 
        music.play();
        
        let fadeIn = setInterval(() => {
            if (music.volume < 0.5) {
                music.volume += 0.05;
            } else {
                clearInterval(fadeIn);
            }
        }, 100);

        musicIcon.classList.add('rotating');
        musicStatus.innerText = "Playing";
    } else {
        music.pause();
        musicIcon.classList.remove('rotating');
        musicStatus.innerText = "Paused";
    }
}

// 6. ALERT & LOGOUT
function showAlert(message, type) {
    const overlay = document.getElementById('custom-alert');
    const msgEl = document.getElementById('alert-message');
    const iconEl = document.getElementById('alert-icon');
    
    msgEl.innerText = message;
    iconEl.innerHTML = (type === 'success') ? 
        '<i class="fas fa-check-circle icon-success"></i>' : 
        '<i class="fas fa-info-circle icon-info"></i>';
    
    overlay.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

function logout() {
    showAlert("Kamu akan keluar dari akun...", "info");
    setTimeout(() => {
        // Bersihkan semua data spesifik akun
        localStorage.removeItem('namaLengkap');
        localStorage.removeItem('usernameAsli');
        localStorage.removeItem('userBio');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        window.location.href = "index.html";
    }, 2000);
}

async function saveProfile() {
    const usernameAsli = localStorage.getItem('usernameAsli');
    const role = localStorage.getItem('userRole');
    const newDisplayName = document.getElementById('edit-name').value;
    const newBio = document.getElementById('edit-bio').value;

    closeEditProfile();
    showAlert("Menyimpan perubahan...", "info");

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateProfile',
                role: role,
                usernameAsli: usernameAsli,
                newDisplayName: newDisplayName,
                newBio: newBio
            })
        });
        const result = await response.json();
        if (result.success) {
            localStorage.setItem('namaLengkap', newDisplayName);
            localStorage.setItem('userBio', newBio);
            document.getElementById('display-name').innerText = "Halo, " + newDisplayName;
            showAlert("Profil berhasil diupdate!", "success");
        }
    } catch (e) { showAlert("Gagal koneksi", "error"); }
}

// Fungsi untuk cari user (update bagian button-nya)
async function searchUser() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    if (keyword.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${WEB_APP_URL}?action=getUsers`);
        const result = await response.json();

        if (result.success) {
            const users = result.users;
            const filtered = users.filter(u => u.nama.toLowerCase().includes(keyword));
            resultsContainer.innerHTML = '';

            filtered.forEach(user => {
                // Kita simpan data user ke dalam string JSON biar gampang dikirim ke fungsi view
                const userData = JSON.stringify(user).replace(/"/g, '&quot;');
                
                const card = `
                    <div class="card" style="width: 180px; padding: 15px;">
                        <h4 style="font-size: 0.9rem;">${user.nama}</h4>
                        <button onclick="viewProfile('${userData}')" style="margin-top: 10px; padding: 5px 10px; font-size: 0.7rem; cursor: pointer; border-radius: 5px; border: none; background: #00f2fe; color: black; font-weight: bold;">Lihat Profil</button>
                    </div>
                `;
                resultsContainer.innerHTML += card;
            });
        }
    } catch (err) {
        console.error("Gagal cari:", err);
    }
}

// Fungsi untuk buka modal intip profil
function viewProfile(userDataJson) {
    const user = JSON.parse(userDataJson);
    
    document.getElementById('view-name').innerText = user.nama;
    document.getElementById('view-role').innerText = user.role;
    document.getElementById('view-bio').innerText = user.bio || "Tidak ada bio.";
    document.getElementById('view-avatar').innerText = user.nama.charAt(0).toUpperCase();
    
    document.getElementById('view-profile-modal').classList.remove('hidden');
}

function closeViewProfile() {
    document.getElementById('view-profile-modal').classList.add('hidden');
}

// Fungsi Cari User di Database
async function searchUser() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const dropdown = document.getElementById('search-results-dropdown');
    
    if (keyword.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`${WEB_APP_URL}?action=getUsers`);
        const result = await response.json();

        if (result.success) {
            const filtered = result.users.filter(u => u.nama.toLowerCase().includes(keyword));
            dropdown.innerHTML = '';

            if (filtered.length > 0) {
                dropdown.classList.remove('hidden');
                filtered.forEach(user => {
                    // Bungkus data user ke JSON string untuk dikirim ke fungsi viewProfile
                    const userData = JSON.stringify(user).replace(/"/g, '&quot;');
                    dropdown.innerHTML += `
                        <div class="search-item" onclick="viewProfile('${userData}')">
                            <h5>${user.nama}</h5>
                            <span>${user.role}</span>
                        </div>
                    `;
                });
            } else {
                dropdown.innerHTML = '<div class="search-item"><span>Tidak ditemukan</span></div>';
            }
        }
    } catch (err) {
        console.error("Gagal ambil data:", err);
    }
}

// Fungsi Lihat/Telusuri Akun
function viewProfile(userDataJson) {
    const user = JSON.parse(userDataJson);
    const modal = document.getElementById('view-profile-modal');
    
    document.getElementById('view-name').innerText = user.nama;
    document.getElementById('view-role').innerText = user.role;
    document.getElementById('view-bio').innerText = user.bio || "Warga XII TKJ 1 belum buat bio.";
    document.getElementById('view-avatar').innerText = user.nama.charAt(0).toUpperCase();
    
    modal.classList.remove('hidden');
    document.getElementById('search-results-dropdown').classList.add('hidden'); // Tutup dropdown
}

function closeViewProfile() {
    document.getElementById('view-profile-modal').classList.add('hidden');
}

// Tutup dropdown kalau klik luar area search
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search')) {
        document.getElementById('search-results-dropdown').classList.add('hidden');
    }
});

function inisialisasiSlider(sliderId, dotsId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const dots = document.getElementById(dotsId).querySelectorAll('.dot');
    const container = slider.parentElement;

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    const updateUI = () => {
        slider.style.transition = 'transform 0.4s ease-out';
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    // Fungsi mulai geser
    const onStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        slider.style.transition = 'none'; // Matikan animasi pas lagi ditarik biar nempel
        
        // Mencegah block warna biru/seleksi teks
        if (e.type === 'mousedown') e.preventDefault(); 
    };

    // Fungsi saat ditarik
    const onMove = (e) => {
        if (!isDragging) return;
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const moveDistance = ((currentX - startX) / container.offsetWidth) * 100;
        
        // Gerakan nempel di kursor
        slider.style.transform = `translateX(${(currentIndex * -100) + moveDistance}%)`;
    };

    // Fungsi saat dilepas
    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].pageX;
        const diff = endX - startX;

        // Sensitivitas geser: minimal 50px
        if (diff < -50 && currentIndex < dots.length - 1) {
            currentIndex++;
        } else if (diff > 50 && currentIndex > 0) {
            currentIndex--;
        }

        updateUI();
    };

    // Event Listeners
    container.addEventListener('mousedown', onStart);
    container.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd); // Pakai window biar kalau mouse lepas container tetep ke-detect

    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: true });
    container.addEventListener('touchend', onEnd);
}

// Jalankan Slider
document.addEventListener('DOMContentLoaded', () => {
    inisialisasiSlider('slider-1', 'dots-1');
    inisialisasiSlider('slider-2', 'dots-2');
    inisialisasiSlider('slider-3', 'dots-3');
});