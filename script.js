const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyr6G3SXEhPYYSfcgZ225-XxSDvTrQe3fQ0tqBMIwlg5GZKIidYJDwKwAxWkzG1M3Jb/exec";

// 1. Fungsi Utama Kirim Data
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
            // Simpan data ke localStorage agar bisa dipanggil di kelas.html
            localStorage.setItem('namaLengkap', payload.nama);
            localStorage.setItem('userRole', payload.role);
            localStorage.setItem('isLoggedIn', 'true');

            showAlert(result.msg, 'success');

            // Redirect jika Sign In atau jika Visitor (Visitor gak perlu Sign Up)
            if (payload.action === 'signin' || payload.role === 'visitor') {
                setTimeout(() => { window.location.href = "kelas.html"; }, 1500);
            } else {
                // Balik ke login setelah daftar (buat Siswa/Guru)
                setTimeout(() => { toggleForm(); }, 1500);
            }
        } else {
            showAlert(result.msg, 'error');
        }
    } catch (err) {
        console.error(err);
        showAlert("⚠️ Gagal koneksi ke server.", "error");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// 2. Event Listener Sign In
document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.querySelector('#signin-box .tab-btn.active').innerText.toLowerCase();
    const namaInput = e.target.querySelectorAll('input')[0].value;
    const passInput = document.getElementById('pass-signin').value;

    processForm({ 
        action: 'signin', 
        role: role, 
        nama: namaInput, 
        password: (role === 'visitor') ? "VISITOR_PASS" : passInput 
    });
});

// 3. Event Listener Sign Up
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const role = document.querySelector('#signup-box .tab-btn.active').innerText.toLowerCase();
    const nama = e.target.querySelector('input[type="text"]').value;
    const password = document.getElementById('pass-signup').value;
    const nis = (role === 'siswa') ? e.target.querySelector('input[type="number"]').value : "";

    processForm({ action: 'signup', role, nama, nis, password });
});

// 4. Fungsi Tab (Switch Role)
function switchRole(formType, role) {
    const containerId = formType === 'signin' ? 'signin-box' : 'signup-box';
    const form = document.querySelector(`#${containerId} form`);
    form.reset();

    const buttons = document.querySelectorAll(`#${containerId} .tab-btn`);
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

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
    } else {
        const nisGrp = document.getElementById('signup-nis-group');
        const passGrp = document.getElementById('signup-pass-group');
        const repGrp = document.getElementById('signup-repeat-group');
        
        nisGrp.style.display = (role === 'siswa') ? 'block' : 'none';
        passGrp.style.display = 'block';
        repGrp.style.display = 'block';
    }
}

// 5. Alert & Toggle (Sisanya tetep sama)
function showAlert(message, type) {
    const overlay = document.getElementById('custom-alert');
    document.getElementById('alert-message').innerText = message;
    const iconEl = document.getElementById('alert-icon');
    iconEl.innerHTML = (type === 'success') ? '<i class="fas fa-check-circle icon-success"></i>' : '<i class="fas fa-exclamation-circle icon-error"></i>';
    overlay.classList.remove('hidden');
}
function closeAlert() { document.getElementById('custom-alert').classList.add('hidden'); }
function toggleForm() {
    document.getElementById('signin-box').classList.toggle('hidden');
    document.getElementById('signup-box').classList.toggle('hidden');
}