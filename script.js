const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyJeLg1muriLYfTR_T0cVCiUvghGh4-mWSeXFYnKBe6Itek1PseLcvYaZHMB0Sx0Hbu/exec";

async function processForm(payload) {
    const btn = event.submitter;
    const originalText = btn.innerText;
    btn.innerText = "Sabar, Le...";
    btn.disabled = true;

    try {
        // Kita kirim sebagai text/plain untuk menghindari CORS preflight yang ribet
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ " + result.msg);
            // Jika login atau visitor, langsung pindah halaman
            if (payload.action === 'signin' || payload.role === 'visitor') {
                window.location.href = "kelas.html";
            } else {
                // Jika sukses daftar, pindah ke form sign in
                toggleForm(); 
            }
        } else {
            alert("❌ " + result.msg);
        }
    } catch (err) {
        console.error(err);
        alert("⚠️ Gagal koneksi ke server. Pastikan URL Web App bener dan sudah di-Deploy!");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Pasang event listener seperti sebelumnya...
document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.querySelector('#signin-box .tab-btn.active').innerText.toLowerCase();
    processForm({ 
        action: 'signin', 
        role, 
        nama: e.target.querySelectorAll('input')[0].value, 
        password: document.getElementById('pass-signin').value 
    });
});

// Di dalam event listener signup-form
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const role = document.querySelector('#signup-box .tab-btn.active').innerText.toLowerCase();
    const nama = e.target.querySelector('input[type="text"]').value;
    const password = document.getElementById('pass-signup').value;
    
    let nis = "";
    if (role === 'siswa') {
        const nisInput = e.target.querySelector('input[type="number"]');
        nis = nisInput.value;
        
        // Cek di awal biar gak buang-buang kuota server
        if (nis.length < 3) { 
            showAlert("NIS tidak valid!", "error");
            return;
        }
    }

    // Kirim data ke processForm
    processForm({ 
        action: 'signup', 
        role: role, 
        nama: nama, 
        nis: nis, 
        password: password 
    });
});

function showAlert(message, type) {
    const overlay = document.getElementById('custom-alert');
    const msgEl = document.getElementById('alert-message');
    const iconEl = document.getElementById('alert-icon');
    
    msgEl.innerText = message;
    
    // Set Icon & Warna
    if (type === 'success') {
        iconEl.innerHTML = '<i class="fas fa-check-circle icon-success"></i>';
    } else {
        iconEl.innerHTML = '<i class="fas fa-exclamation-circle icon-error"></i>';
    }
    
    overlay.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

// Update processForm lu dibagian Fetch
async function processForm(payload) {
    const btn = event.submitter;
    const originalText = btn.innerText;
    btn.innerText = "Memproses...";
    btn.disabled = true;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            showAlert(result.msg, 'success');
            // Kasih delay sedikit biar user sempet baca notif sebelum pindah halaman
            if (payload.action === 'signin' || payload.role === 'visitor') {
                setTimeout(() => { window.location.href = "kelas.html"; }, 2000);
            } else {
                setTimeout(() => { 
                    closeAlert();
                    toggleForm(); 
                }, 2000);
            }
        } else {
            showAlert(result.msg, 'error');
        }
    } catch (err) {
        showAlert("Gagal terhubung ke server!", "error");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

if (result.success) {
    // Simpan data dengan kunci yang konsisten
    localStorage.setItem('userRole', payload.role); 
    localStorage.setItem('userNama', payload.nama);
    localStorage.setItem('isLoggedIn', 'true'); // Tambahin ini buat penanda

    showAlert(result.msg, 'success');
    
    // Kasih jeda dikit biar browser sempet nulis data ke storage
    setTimeout(() => { 
        window.location.href = "kelas.html"; 
    }, 1500);
} else {
    showAlert(result.msg, 'error');
}

function switchRole(formType, role) {
    // 1. Tentukan container mana yang lagi dimainin (signin-box atau signup-box)
    const boxId = formType === 'signin' ? 'signin-box' : 'signup-box';
    const currentBox = document.getElementById(boxId);
    const form = currentBox.querySelector('form');
    
    // 2. Reset input di form yang aktif aja biar bersih
    form.reset();

    // 3. Atur tombol tab yang aktif HANYA di box yang sedang dibuka
    const buttons = currentBox.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // --- LOGIKA UNTUK SIGN IN ---
    if (formType === 'signin') {
        const passGroup = document.getElementById('signin-pass-group');
        const passInput = document.getElementById('pass-signin');

        if (role === 'visitor') {
            passGroup.style.display = 'none';
            passInput.removeAttribute('required');
        } else {
            passGroup.style.display = 'block';
            passInput.setAttribute('required', '');
        }
    }

    // --- LOGIKA UNTUK SIGN UP ---
    if (formType === 'signup') {
        const nisGroup = document.getElementById('signup-nis-group');
        const passGroup = document.getElementById('signup-pass-group');
        const repeatGroup = document.getElementById('signup-repeat-group');
        
        // Ambil inputnya buat atur required secara dinamis
        const nisInput = nisGroup.querySelector('input');
        const passInput = passGroup.querySelector('input');
        const repeatInput = repeatGroup.querySelector('input');

        if (role === 'siswa') {
            nisGroup.style.display = 'block';
            nisInput.setAttribute('required', '');
            passGroup.style.display = 'block';
            passInput.setAttribute('required', '');
            repeatGroup.style.display = 'block';
        } 
        else if (role === 'guru') {
            nisGroup.style.display = 'none'; // Sembunyi buat Guru
            nisInput.removeAttribute('required'); 
            passGroup.style.display = 'block';
            passInput.setAttribute('required', '');
            repeatGroup.style.display = 'block';
        } 
        else if (role === 'visitor') {
            nisGroup.style.display = 'none';
            nisInput.removeAttribute('required');
            passGroup.style.display = 'none';
            passInput.removeAttribute('none');
            repeatGroup.style.display = 'none';
        }
    }
}
    
    // Reset form biar bersih
    form.reset();

    // Atur tombol aktif
    const buttons = document.querySelectorAll(`#${containerId} .tab-btn`);
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (formType === 'signin') {
        const passGroup = document.getElementById('signin-pass-group');
        const passInput = document.getElementById('pass-signin');

        if (role === 'visitor') {
            passGroup.style.display = 'none';
            passInput.removeAttribute('required'); // *** INI KUNCINYA: Biar bisa disubmit tanpa pass
        } else {
            passGroup.style.display = 'block';
            passInput.setAttribute('required', ''); // Balikin wajib isi buat Siswa/Guru
        }
    } else {
        // Logika Sign Up (Sama kayak sebelumnya)
        const nis = document.getElementById('signup-nis-group');
        const pass = document.getElementById('signup-pass-group');
        const repeat = document.getElementById('signup-repeat-group');
        
        const passInputUp = document.getElementById('pass-signup');
        const repeatInputUp = document.getElementById('pass-repeat');

        if (role === 'visitor') {
            nis.style.display = 'none';
            pass.style.display = 'none';
            repeat.style.display = 'none';
            passInputUp.removeAttribute('required');
            repeatInputUp.removeAttribute('required');
        } else {
            // ... atur display block ...
            passInputUp.setAttribute('required', '');
            repeatInputUp.setAttribute('required', '');
        }
    }

document.getElementById('signin-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const role = document.querySelector('#signin-box .tab-btn.active').innerText.toLowerCase();
    const nama = e.target.querySelector('input[type="text"]').value;
    
    // Kalau visitor, password kita set kosong aja
    const password = (role === 'visitor') ? "" : document.getElementById('pass-signin').value;

    processForm({ action: 'signin', role, nama, password });

});

