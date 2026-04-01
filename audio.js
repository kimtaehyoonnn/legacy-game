// 사운드 관리
const SOUNDS = {
    bgmMain: document.getElementById('bgm-main'),
};
let savedVolume = 0.4;
SOUNDS.bgmMain.volume = savedVolume;

function _removeBgmStartListeners() {
    document.removeEventListener('click', _onFirstInteractionBgm);
    document.removeEventListener('touchstart', _onFirstInteractionBgm);
    document.removeEventListener('keydown', _onFirstInteractionBgm);
}

function _onFirstInteractionBgm() {
    const overlay = document.getElementById('autoplay-overlay');
    if (overlay) overlay.remove();
    SOUNDS.bgmMain.play().catch(() => {});
    _removeBgmStartListeners();
}

// 브라우저 자동재생 정책 대응: 로드 즉시 재생 시도, 실패 시 오버레이 표시
(function initBgm() {
    const playPromise = SOUNDS.bgmMain.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            const overlay = document.createElement('div');
            overlay.id = 'autoplay-overlay';
            overlay.style.cssText = [
                'position:fixed', 'inset:0', 'z-index:99999',
                'display:flex', 'flex-direction:column',
                'align-items:center', 'justify-content:center',
                'background:rgba(0,0,0,0.55)', 'cursor:pointer',
                'font-family:Alimjang,sans-serif'
            ].join(';');
            overlay.innerHTML = '<div style="color:#fff;font-size:26px;font-weight:bold;text-shadow:0 2px 8px #000;">🎵 화면을 클릭하면 게임이 시작됩니다</div>';
            overlay.addEventListener('click', _onFirstInteractionBgm, { once: true });
            document.body.appendChild(overlay);

            document.addEventListener('click', _onFirstInteractionBgm);
            document.addEventListener('touchstart', _onFirstInteractionBgm);
            document.addEventListener('keydown', _onFirstInteractionBgm);
        });
    }
})();

function setVolume(val) {
    const v = Math.max(0, Math.min(100, Number(val))) / 100;
    SOUNDS.bgmMain.volume = v;
    SOUNDS.bgmMain.muted = false;
    savedVolume = v;
    document.getElementById('mute-btn').textContent = v === 0 ? '🔇' : '🔊';
}

function toggleMute() {
    const isMuted = !SOUNDS.bgmMain.muted;
    SOUNDS.bgmMain.muted = isMuted;
    const btn = document.getElementById('mute-btn');
    const slider = document.getElementById('volume-slider');
    if (isMuted) {
        btn.textContent = '🔇';
        slider.value = 0;
    } else {
        btn.textContent = '🔊';
        slider.value = Math.round(savedVolume * 100);
    }
}
