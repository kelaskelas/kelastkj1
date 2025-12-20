// Ambil nama user dari LocalStorage (Data dari halaman login tadi)
document.addEventListener('DOMContentLoaded', () => {
    const namaUser = localStorage.getItem('namaLengkap') || 'User';
    document.getElementById('display-name').innerText = "Halo, " + namaUser;
});

// Fungsi Dropdown Setting
function toggleMenu() {
    document.getElementById('dropdown-menu').classList.toggle('active');
}

// Tutup menu kalau klik di luar
window.onclick = function(event) {
    if (!event.target.matches('.settings-btn')) {
        const dropdown = document.getElementById('dropdown-menu');
        if (dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    }
}

// Fungsi Logout
function logout() {
    localStorage.clear();
    
    // Ambil URL dasar tanpa nama file
    // Hasilnya akan balik ke https://kelaskelas.github.io/kelastkj1/
    const rootPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    window.location.href = rootPath;
}
window.onload = function() {
    // 1. Ambil data dari loker bernama 'namaLengkap'
    const clientName = localStorage.getItem('namaLengkap');

    // 2. Tembak ke elemen HTML-nya
    const displayElement = document.getElementById('display-name');

    if (clientName) {
        // Kalau ketemu, munculin: Halo, Nama Client
        displayElement.innerText = "Halo, " + clientName;
    } else {
        // Kalau beneran kosong (misal orang iseng langsung buka file html-nya)
        displayElement.innerText = "Halo, Member";
    }
};

function showAlert(message, type) {
    const overlay = document.getElementById('custom-alert');
    const msgEl = document.getElementById('alert-message');
    const iconEl = document.getElementById('alert-icon');
    
    msgEl.innerText = message;
    
    if (type === 'success') {
        iconEl.innerHTML = '<i class="fas fa-check-circle icon-success"></i>';
    } else {
        iconEl.innerHTML = '<i class="fas fa-info-circle icon-info"></i>';
    }
    
    overlay.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

// CONTOH: Panggil notif pas pertama kali masuk kelas
document.addEventListener('DOMContentLoaded', () => {
    const namaUser = localStorage.getItem('namaLengkap') || 'User';
    document.getElementById('display-name').innerText = "Halo, " + namaUser;
    
    // Munculin alert penyambutan
    setTimeout(() => {
        showAlert("Selamat datang di Dashboard Kelas, " + namaUser + "!", "success");
    }, 500);
});

// Update fungsi Logout biar pake alert dulu
function logout() {
    showAlert("Kamu akan keluar dari akun...", "info");
    setTimeout(() => {
        localStorage.removeItem('namaLengkap');
        window.location.href = "index.html";
    }, 2000);
}

const music = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
const musicStatus = document.getElementById('music-status');

function toggleMusic() {
    if (music.paused) {
        music.play();
        musicIcon.classList.add('rotating');
        musicStatus.innerText = "Playing";
        music.volume = 0.5; // Set volume 50% biar gak pecah
    } else {
        music.pause();
        musicIcon.classList.remove('rotating');
        musicStatus.innerText = "Paused";
    }
}

// Opsional: Musik otomatis jalan kalau user klik mana aja di layar pertama kali
document.body.addEventListener('click', () => {
   // Cek kalau musik belum jalan, baru kita jalankan
   // Tapi ini kadang mengganggu, lebih baik user klik tombol musiknya sendiri
}, { once: true });

function toggleMusic() {
    const music = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    const musicStatus = document.getElementById('music-status');

    if (music.paused) {
        music.volume = 0; // Mulai dari 0
        music.play();
        
        // Efek Fade In: Volume naik perlahan sampe 0.5
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


