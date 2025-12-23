// 1. KONFIGURASI & URL DATABASE (Ganti sesuai URL Deployment Apps Script lu)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyWDq9SS8eky87yttb8ybd21LPZ5FIoEAEwdtlC7w8nk2i9j5A1zyzD6N8mmjcwKUFb/exec";

document.addEventListener('DOMContentLoaded', () => {
    // Selalu prioritaskan nama yang sudah di-update di localStorage
    const namaUser = localStorage.getItem('namaLengkap') || 'Member';
    const userBio = localStorage.getItem('userBio') || 'Belum ada bio.';
    
    // Update UI
    document.getElementById('display-name').innerText = "Halo, " + namaUser;
    
    // Jika ada elemen bio di dashboard, update juga
    const bioElement = document.getElementById('view-bio');
    if(bioElement) bioElement.innerText = userBio;

    setTimeout(() => {
        showAlert("Selamat datang kembali, " + namaUser + "!", "success");
    }, 500);
});

// Perbaiki fungsi simpan profil agar konsisten
function saveProfile() {
    const newName = document.getElementById('edit-name').value;
    const newBio = document.getElementById('edit-bio').value;

    if (newName.trim() === "") {
        showAlert("Nama tidak boleh kosong!", "error");
        return;
    }

    // Simpan ke LocalStorage agar saat refresh tidak balik ke nama lama
    localStorage.setItem('namaLengkap', newName);
    localStorage.setItem('userBio', newBio);

    // Update UI seketika
    document.getElementById('display-name').innerText = "Halo, " + newName;
    
    // Tutup modal dan beri notif
    closeEditProfile();
    showAlert("Profil berhasil diperbarui!", "success");

    // OPTIONAL: Kirim ke Google Sheets juga biar di database berubah
    // updateDatabase(newName, newBio); 
}

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

    closeEditProfile(); // TUTUP MODAL DULU
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
            localStorage.setItem('namaLengkap', newDisplayName);
            localStorage.setItem('userBio', newBio);
            document.getElementById('display-name').innerText = "Halo, " + newDisplayName;
            showAlert("Berhasil diupdate!", "success");
        }
    } catch (e) { showAlert("Gagal koneksi", "error"); }
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

// Update fungsi logout biar bener-bener bersih
function logout() {
    showAlert("Kamu akan keluar dari akun...", "info");
    setTimeout(() => {
        localStorage.clear(); // <--- PAKAI INI, jangan satu-satu biar gak ada yang nyangkut
        window.location.href = "index.html";
    }, 2000);
}

// Update DOMContentLoaded agar selalu ambil yang terbaru
document.addEventListener('DOMContentLoaded', () => {
    const namaUser = localStorage.getItem('namaLengkap') || 'Member';
    const bioUser = localStorage.getItem('userBio') || 'Warga XII TKJ 1 belum buat bio.';
    
    // Update Nama di Header
    document.getElementById('display-name').innerText = "Halo, " + namaUser;
    
    // Update Bio di Modal Profil (jika ada elemennya)
    const bioText = document.getElementById('view-bio');
    if (bioText) bioText.innerText = bioUser;

    setTimeout(() => {
        showAlert("Selamat datang kembali, " + namaUser + "!", "success");
    }, 500);
});

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