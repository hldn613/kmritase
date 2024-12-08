var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js';
document.head.appendChild(script);

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
    let allLinks = [];

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
    }

    const mainButtons = document.querySelectorAll('.details');

    mainButtons.forEach((btn, index) => {
      btn.addEventListener('click', async () => {
        if (isStopped) {
          return;
        }

        console.log(`Tombol Details ${index + 1} ditekan`);

        const popupLinks = await clickMainButtonUntilLinksFound(btn);

        await collectLinks(popupLinks, index + 1);

        if (index < mainButtons.length - 1) {
          console.log(`Melanjutkan ke Tombol Details ${index + 2}`);
          mainButtons[index + 1].click();
        } else {
          console.log("download dimulai")
          await downloadFiles();
        }
      }, { once: true });
    });

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

  } else {
    console.log('URL tidak cocok, skrip tidak dijalankan.');
  }
}

function openModal() {
  const modalHTML = `
      <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Input Password</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <div class="mb-3">
                          <label for="key21" class="form-label">Password</label>
                          <input type="password" class="form-control" id="key21">
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="button" class="btn btn-primary" onclick="checkkey21()">Submit</button>
                  </div>
              </div>
          </div>
      </div>
  `;
  document.getElementById('modalContainer').innerHTML = modalHTML;
  const myModal = new bootstrap.Modal(document.getElementById('myModal'));
  myModal.show();
}

function checkkey21() {
  const key21 = document.getElementById('key21').value;
  const validHashes = [
    '18462725b3be3ad2db24f99f62c6b43f',
    '3858f62230ac3c915f300c664312c63f'
  ];
  const key21Hash = CryptoJS.MD5(key21).toString();

  if (validHashes.includes(key21Hash)) {
    const myModal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
    myModal.hide();
    checkUrlAndRunScript()
  } else {
    alert('Password salah. Silakan coba lagi.');
  }
}
openModal()
