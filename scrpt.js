const modalContainerDiv = document.createElement('div');
modalContainerDiv.id = 'modalContainer';
document.body.appendChild(modalContainerDiv);

const allowedURLs = [
  'https://mitradarat-fms.kemenhub.go.id/digitalchecker/kmritase',
  'https://mitradarat-fms.debhub.go.id/digitalchecker/kmritase'
];

const currentURL = window.location.href;
function checkUrlAndRunScript() {
    if (allowedURLs.includes(currentURL)) {
      console.log('URL cocok, menjalankan skrip...');
  
      function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
  
      let isPaused = false;
      let isStopped = false;
      let isRunning = false; // Variabel untuk melacak status proses
      let allLinks = [];
      let mainButtons; // Deklarasi di luar untuk akses global
  
      async function collectLinks(links, mainButtonIndex) {
        for (let i = 0; i < links.length; i++) {
          if (links[i].classList.contains('tooltipp')) {
            allLinks.push({ url: links[i].href, index: mainButtonIndex, linkIndex: i + 1 });
          }
        }
      }
  
      async function clickMainButtonUntilLinksFound(btn) {
        let popupLinks = [];
        do {
          btn.click();
          await wait(1000);
          popupLinks = document.querySelectorAll('a.tooltipp');
        } while (popupLinks.length === 0 && !isStopped);
        return popupLinks;
      }
  
      async function downloadFiles() {
        for (let i = 0; i < allLinks.length; i++) {
          while (isPaused) {
            await wait(100);
          }
          if (isStopped) {
            break;
          }
  
          function convertDateString(dateString) {
            // Pisahkan tanggal dan waktu
            const [datePart, timePart] = dateString.split(' ');
  
            // Pisahkan bagian tahun, bulan, dan hari
            const [year, month, day] = datePart.split('-');
  
            // Gabungkan kembali dalam format baru
            const newDateString = `${day}-${month}-${year} ${timePart}`;
  
            return newDateString;
          }
  
          function convertUrlToFilename(url, mainButtonIndex, linkIndex) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
  
            const noken = urlParams.get('noken').replace(/\+/g, '-');
            const dateStart1 = urlParams.get('date_start').replace(/%3A/g, ':').replace(/\+/g, ' ').replace(/:/g, '_');
            const dateEnd1 = urlParams.get('date_end').replace(/%3A/g, ':').replace(/\+/g, ' ').replace(/:/g, '_');
  
            const dateStart = convertDateString(dateStart1);
            const dateEnd = convertDateString(dateEnd1);
  
            const filename = `${noken}_Rit-${linkIndex}_${dateStart}_${dateEnd}`;
            return filename;
          }
  
          const { url, index: mainButtonIndex, linkIndex } = allLinks[i];
          const convertedFilename = convertUrlToFilename(url, mainButtonIndex, linkIndex);
  
          console.log(convertedFilename);
  
          try {
            const response = await fetch(url);
  
            if (!response.ok) {
              throw new Error('Jaringan bermasalah');
            }
  
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${convertedFilename}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
  
            console.log(`File dari URL ${url} telah berhasil diunduh`);
  
            await wait(1000);
          } catch (error) {
            console.error(`Gagal mengunduh file dari URL ${url}:`, error);
          }
        }
        console.log('DONE');
        showModal();
        isRunning = false; // Proses selesai
        document.getElementById('startBtn').disabled = false; // Aktifkan tombol Start kembali
      }
  
      function setUpEventListeners() {
        mainButtons = document.querySelectorAll('.details'); // Inisialisasi di sini
        mainButtons.forEach((btn, index) => {
          btn.addEventListener('click', async () => {
            if (isStopped) {
              return;
            }
  
            console.log(`Load Unit ${index + 1}`);
  
            const popupLinks = await clickMainButtonUntilLinksFound(btn);
  
            await collectLinks(popupLinks, index + 1);
  
            if (index < mainButtons.length - 1) {
              console.log(`Melanjutkan ke Unit ${index + 2}`);
              mainButtons[index + 1].click();
            } else {
              console.log('download dimulai');
              await downloadFiles();
            }
          }, { once: true });
        });
      }
  
      function startProcess() {
        if (!isRunning) { 
          isPaused = false;
          isStopped = false;
          isRunning = true; 
          document.getElementById('startBtn').disabled = true; 
          if (mainButtons.length > 0) { 
            mainButtons[0].click();
          } else {
            console.log('Tidak ada tombol untuk diproses.');
          }
        } else {
          console.log('Proses sedang berjalan, tunggu sampai selesai.');
        }
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
        isRunning = false; // Proses direset
        allLinks = [];
        console.log('Proses di-reset');
        document.getElementById('startBtn').disabled = false; // Aktifkan tombol Start kembali
        setUpEventListeners(); // Pasang event listener baru
      }
  
      function createControlButton(id, text, onClick) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.addEventListener('click', onClick);
        document.getElementById('controls').appendChild(button);
      }
  
      const controlsDiv = document.createElement('div');
      controlsDiv.id = 'controls';
      controlsDiv.style.position = 'fixed';
      controlsDiv.style.bottom = '20px';
      controlsDiv.style.right = '20px';
      controlsDiv.style.display = 'flex';
      controlsDiv.style.flexDirection = 'column';
      controlsDiv.style.gap = '10px';
      controlsDiv.style.zIndex = '9990';
      document.getElementById('tab').appendChild(controlsDiv);
  
      createControlButton('showModalBtn', 'Traktir Kopi', showModal);
      createControlButton('startBtn', 'Start', startProcess);
      createControlButton('pauseBtn', 'Pause', pauseProcess);
      createControlButton('resumeBtn', 'Resume', resumeProcess);
      createControlButton('resetBtn', 'Reset', resetProcess);
  
      // Observer untuk mendeteksi perubahan pada tabel data
      const tableObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'subtree') {
            console.log('Perubahan terdeteksi.');
            resetProcess();
          }
        });
      });
  
      const tableElement = document.getElementById('datatable');
      if (tableElement) {
        tableObserver.observe(tableElement, { childList: true, subtree: true });
      }
  
      setUpEventListeners();
    } else {
      console.log('URL tidak cocok, skrip tidak dijalankan.');
    }
  }


function showModal() {
  const modalContainer = document.getElementById('modalContainer');

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
          <a href="https://saweria.co/hldn613" target="_blank" class="btn btn-primary">TRAKTIR KOPI</a>
        </div>
      </div>
    </div>
  `;

  modalContainer.appendChild(modalDiv);

  const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
  modal.show();
}

function validasiuser() {
  const paragraphs = document.getElementsByTagName('span');
  const secondParagraph = paragraphs[9].innerHTML;

  // Daftar nama
  const daftarNama = [
    'rizkybayu00',
    'btsmakasar1'
  ];

  // Nama yang akan diperiksa
  const nama = secondParagraph;

  // Memeriksa apakah nama ada dalam daftar
  if (daftarNama.includes(nama)) {
    checkUrlAndRunScript()
  } else {
    console.log('Maaf Anda Tidak Terdaftar.Silangkan Traktir Kopi Terlebih dahulu');
    showModal()
  }
}

validasiuser()
