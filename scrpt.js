// URL yang diinginkan
const desiredUrl = 'https://mitradarat-fms.dephub.go.id/digitalchecker/kmritase';

// Fungsi untuk memeriksa URL dan menjalankan skrip
function checkUrlAndRunScript() {
  if (window.location.href === desiredUrl) {
    // Tempatkan skrip Anda di sini
    console.log('URL cocok, menjalankan skrip...');

    // Contoh skrip Anda yang dijalankan
    // Fungsi untuk menunggu beberapa waktu
    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Variabel untuk kontrol
    let isPaused = false;
    let isStopped = false;

    // Fungsi untuk "menekan" hyperlink satu per satu secara berurutan
    async function clickLinks(links) {
      for (let i = 0; i < links.length; i++) {
        while (isPaused) {
          await wait(100); // Tunggu hingga tidak pause
        }
        if (isStopped) {
          break; // Berhenti jika reset
        }

        // Tambahkan target _blank melalui JavaScript
        links[i].setAttribute('target', '_blank');

        console.log(`Menekan Hyperlink ${i + 1}`);
        links[i].click(); // "Klik" hyperlink
        await wait(4000); // Tunggu 4 detik sebelum "menekan" hyperlink berikutnya
      }
    }

    // Ambil semua elemen tombol utama dengan class 'details'
    const mainButtons = document.querySelectorAll('.details');

    // Tambahkan event listener pada setiap tombol utama
    mainButtons.forEach((btn, index) => {
      btn.addEventListener('click', async () => {
        if (isStopped) {
          return; // Jika proses di-reset, jangan lanjut
        }

        console.log(`Tombol Details ${index + 1} ditekan`);

        await wait(3000); // Tambahkan delay sebelum Ambil semua hyperlink di dalam popup dengan class 'tooltipp'
        const popupLinks = document.querySelectorAll('.tooltipp');

        // "Tekan" hyperlink dalam popup satu per satu dengan delay
        await clickLinks(popupLinks);

        // Lanjutkan ke tombol utama berikutnya jika ada
        if (index < mainButtons.length - 1) {
          console.log(`Melanjutkan ke Tombol Details ${index + 2}`);
          mainButtons[index + 1].click();
        } else {
          // Panggil showModal setelah tombol terakhir ditekan
          showModal();
        }
      }, { once: true }); // Event listener hanya sekali eksekusi per tombol
    });

    // Fungsi kontrol
    function startProcess() {
      isPaused = false;
      isStopped = false;
      mainButtons[0].click();
    }

    function pauseProcess() {
      isPaused = true;
    }

    function resumeProcess() {
      isPaused = false;
    }

    function resetProcess() {
      isPaused = false;
      isStopped = true;
      console.log('Proses di-reset');
    }

    // Fungsi untuk menampilkan modal
    function showModal() {
      const modalContainer = document.getElementById('modalContainer');

      // Membuat elemen modal
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal fade';
      modalDiv.id = 'exampleModal';
      modalDiv.tabIndex = '-1';
      modalDiv.setAttribute('aria-labelledby', 'exampleModalLabel');
      modalDiv.setAttribute('aria-hidden', 'true');
      modalDiv.style.zIndex = '9991';
      modalDiv.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Modal Title</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <img src="https://i.pinimg.com/736x/28/bb/e5/28bbe57e0613091ccd39e718d8679abd.jpg" style="width: -webkit-fill-available;">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">SAYA PELIT</button>
              <a href="https://saweria.co/hldn613" class="btn btn-primary">TRAKTIR KOPI</a>
            </div>
          </div>
        </div>
      `;

      // Menambahkan elemen modal ke dalam container
      modalContainer.appendChild(modalDiv);

      // Menampilkan modal menggunakan Bootstrap 5
      const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
      modal.show();
    }

    // Tambahkan tombol kontrol secara dinamis di dalam div
    function createControlButton(id, text, onClick) {
      const button = document.createElement('button');
      button.id = id;
      button.textContent = text;
      button.addEventListener('click', onClick);
      document.getElementById('controls').appendChild(button);
    }

    // Buat elemen div untuk menampung tombol kontrol dan tambahkan ke elemen dengan id 'tab'
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';
    controlsDiv.style.position = 'fixed';
    controlsDiv.style.bottom = '20px';
    controlsDiv.style.right = '20px';
    controlsDiv.style.display = 'flex';
    controlsDiv.style.flexDirection = 'column';
    controlsDiv.style.gap = '10px';
    controlsDiv.style.zIndex = '9990'; // Menambahkan z-index 9999
    document.getElementById('tab').appendChild(controlsDiv);

    createControlButton('showModalBtn', 'Traktir Kopi', showModal);
    createControlButton('startBtn', 'Start', startProcess);
    createControlButton('pauseBtn', 'Pause', pauseProcess);
    createControlButton('resumeBtn', 'Resume', resumeProcess);
    createControlButton('resetBtn', 'Reset', resetProcess);

    // Menambahkan container untuk modal ke dalam body
    const modalContainerDiv = document.createElement('div');
    modalContainerDiv.id = 'modalContainer';
    document.body.appendChild(modalContainerDiv);
  } else {
    console.log('URL tidak cocok, skrip tidak dijalankan.');
  }
}

// Panggil fungsi untuk memeriksa URL dan menjalankan skrip
checkUrlAndRunScript();
