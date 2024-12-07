// URL yang diinginkan
const desiredUrl = 'https://mitradarat-fms.dephub.go.id/digitalchecker/kmritase';

// Fungsi untuk memeriksa URL dan menjalankan skrip
function checkUrlAndRunScript() {
  if (window.location.href === desiredUrl) {
    console.log('URL cocok, menjalankan skrip...');

    // Fungsi untuk menunggu beberapa waktu
    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Variabel untuk kontrol
    let isPaused = false;
    let isStopped = false;
    let allLinks = [];

    // Fungsi untuk mengumpulkan hyperlink secara berurutan
    async function collectLinks(links, mainButtonIndex) {
      for (let i = 0; i < links.length; i++) {
        if (links[i].classList.contains('tooltipp')) {
          allLinks.push({ url: links[i].href, index: mainButtonIndex, linkIndex: i + 1 });
        }
      }
    }

    // Fungsi untuk mengklik tombol utama sampai menemukan hyperlink
    async function clickMainButtonUntilLinksFound(btn) {
      let popupLinks = [];
      do {
        btn.click();
        await wait(1000); // Tambahkan delay untuk menunggu popup muncul
        popupLinks = document.querySelectorAll('a.tooltipp');
      } while (popupLinks.length === 0 && !isStopped);
      return popupLinks;
    }

    // Fungsi untuk mengunduh file secara berurutan menggunakan Fetch API
    async function downloadFiles() {
      for (let i = 0; i < allLinks.length; i++) {
        while (isPaused) {
          await wait(100); // Tunggu hingga tidak pause
        }
        if (isStopped) {
          break; // Berhenti jika reset
        }

        function convertUrlToFilename(url, mainButtonIndex, linkIndex) {
          const urlParams = new URLSearchParams(url.split('?')[1]);

          const noken = urlParams.get('noken').replace(/\+/g, '-');
          const dateStart = urlParams.get('date_start').replace(/%3A/g, ':').replace(/\+/g, ' ').replace(/:/g, '_');
          const dateEnd = urlParams.get('date_end').replace(/%3A/g, ':').replace(/\+/g, ' ').replace(/:/g, '_');

          const filename = `${noken}_Rit-${linkIndex}_${dateStart}_${dateEnd}`;
          return filename;
        }

        const { url, index: mainButtonIndex, linkIndex } = allLinks[i];
        const convertedFilename = convertUrlToFilename(url, mainButtonIndex, linkIndex);

        console.log(convertedFilename); // Output: TB-II-01_Rit-1_2024-11-01_04_59_00_2024-11-01_06_15_00

        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error('Jaringan bermasalah');
          }

          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `${convertedFilename}.xlsx`; // Nama file yang akan diunduh
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          console.log(`File dari URL ${url} telah berhasil diunduh`);

          // Tunggu 1 detik sebelum mengunduh file berikutnya hanya jika unduhan berhasil
          await wait(1000);
        } catch (error) {
          console.error(`Gagal mengunduh file dari URL ${url}:`, error);
        }
      }

      // Jalankan fungsi showModal setelah semua unduhan selesai
      showModal();
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

        const popupLinks = await clickMainButtonUntilLinksFound(btn); // Tekan tombol utama sampai menemukan link

        // Mengumpulkan hyperlink dari setiap popup dengan nomor urut
        await collectLinks(popupLinks, index + 1);

        // Lanjutkan ke tombol utama berikutnya jika ada
        if (index < mainButtons.length - 1) {
          console.log(`Melanjutkan ke Tombol Details ${index + 2}`);
          mainButtons[index + 1].click();
        } else {
          // Unduh semua file setelah semua hyperlink dikumpulkan
          console.log("download dimulai");
          await downloadFiles();
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
              <h5 class="modal-title" id="exampleModalLabel">ADAKAH TRAKTIRAN KOPI OM</h5>
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
    controlsDiv.style.zIndex = '9990'; // Menambahkan z-index 9990
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
