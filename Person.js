const FACE_CONFIG = {
    count: 5,
    types: ['Fa', 'Fb', 'Fc', 'Fd', 'Fe']   // FaceA~FaceE (5가지)
};

// 💡 이미지 에셋 로딩 (동적)
const characterAssets = {
    face: {},
    eyes: {},
    nose: {},
    mouth: {},
    frontHair: {},
    backHair: {},
    clothes: {},
    shoulder: {}
};

// 실제 로드 성공한 에셋 코드 목록 (getRandomVisuals / inheritVisuals에서 사용)
const loadedAssetCodes = {
    eyes: [], nose: [], mouth: [],
    mFrontHair: [], fFrontHair: [],  // 성별 전용 앞머리
    mBackHair:  [], fBackHair:  [],  // 성별 전용 뒷머리
    clothes: [], shoulder: []
};

// 전역 pulse (모든 캐릭터 동기화)
let globalPulse = 0;

// 왕관 이미지 (pre-load)
const crownImg = new Image();
crownImg.src = 'images/crown.png';

// 에셋 타입별 탐색:
// scanAll=false(기본): Xa → Xb → ... 첫 실패 시 중단 (연속적 파일셋 기대)
// scanAll=true: a~z 전체 시도 (코드 순서 무관계)
// codesKey: loadedAssetCodes에서 사용할 키 (기본: assetType)
function probeAssetType(assetType, prefix, scanAll = false, codesKey = null) {
    const targetKey = codesKey || assetType;
    return new Promise(resolve => {
        if (scanAll) {
            let pending = 26;
            for (let i = 0; i < 26; i++) {
                const letter = String.fromCharCode(97 + i);
                const code = `${prefix}${letter.toUpperCase()}`;
                const img = new Image();
                characterAssets[assetType][code] = img;
                img.onload = () => { loadedAssetCodes[targetKey].push(code); if (--pending === 0) resolve(); };
                img.onerror = () => { if (--pending === 0) resolve(); };
                img.src = `images/${prefix}${letter}.png`;
            }
        } else {
            function tryLetter(i) {
                if (i >= 26) { resolve(); return; }
                const letter = String.fromCharCode(97 + i);
                const code = `${prefix}${letter.toUpperCase()}`;
                const img = new Image();
                characterAssets[assetType][code] = img;
                img.onload = () => { loadedAssetCodes[targetKey].push(code); tryLetter(i + 1); };
                img.onerror = () => resolve();
                img.src = `images/${prefix}${letter}.png`;
            }
            tryLetter(0);
        }
    });
}

// 얼굴 이미지 로드
function loadFaceAssets() {
    return Promise.all(FACE_CONFIG.types.map(faceType => new Promise(resolve => {
        const img = new Image();
        characterAssets.face[faceType] = img;
        img.onload = () => resolve();
        img.onerror = () => { console.warn(`[Face] ${faceType}.png 없음`); resolve(); };
        img.src = `images/${faceType}.png`;
    })));
}

const NAMES = { M: ["강민", "준호", "도윤", "시우", "태양", "지훈", "현우", "건우", "민재", "지한"], F: ["서연", "민서", "지아", "하윤", "아린", "수아", "유나", "지윤", "예원", "다인"] };

function getTierColor(tier) {
    if(tier === 'SSR') return '#e67e22'; 
    if(tier === 'SR') return '#9b59b6';
    if(tier === 'R') return '#2980b9'; 
    return '#7f8c8d';
}

class PersonNode {
    constructor(name, gender, x, y, level, age = 0, parents = [], isHead = false, isMain = true, isSpouse = false) {
        this.id = nextId++; 
        this.name = name; 
        this.gender = gender;
        // 좌표 안전성 보장: NaN 방지
        this.x = (typeof x === 'number' && !isNaN(x)) ? x : 0; 
        this.y = (typeof y === 'number' && !isNaN(y)) ? y : 0; 
        this.targetX = this.x;
        this.targetY = this.y; 
        this.level = level; 
        this.age = (typeof age === 'number') ? age : 0;
        this.parents = parents; 
        this.isAlive = true; 
        this.partner = null;
        this.isMarried = false; 
        this.radius = 48; 
        // pulse는 전역 globalPulse 사용 (동기화)
        this.children = [];
        this.isHead = isHead; 
        this.isMain = isMain; 
        this.isSpouse = isSpouse; 
        
        this.menopauseAge = this.gender === 'F' ? Math.floor(Math.random() * 7) + 47 : null;
        this.disease = null;
        this.eventState = {
            firedCodes: new Set(),
            choiceByCode: {}
        };
        this.jobCode = null;
        this.jobName = null;
        this.jobMonthlyIncomeKrw = 0;
        this.jobAssignedMonth = null;
        this.careerStage = 'none';
        
        // 💡 null 에러 방지를 위해 기본값 설정
        this.traits = { 
            app: { tier: 'N', name: '평범한 외모' }, 
            per: { tier: 'N', name: '평범한 성격' }, 
            val: { tier: 'N', name: '현실주의' }, 
            hlt: { tier: 'N', name: '평범한 체력' } 
        };
                this.visuals = { eyes: 'EA', nose: 'NA', mouth: 'MA', face: 'Fa', frontHair: null, clothes: 'CA', shoulder: 'SA' };
    }

    draw(ctx, scale = 1) {
        // 좌표 유효성 검증
        if (typeof this.x !== 'number' || isNaN(this.x) || typeof this.y !== 'number' || isNaN(this.y)) {
            return;
        }

        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;

        const s = this.isAlive ? 1 + Math.sin(globalPulse) * 0.03 : 1;

        const imgHeight = Math.round(this.radius * 2.6);
        const imgWidth = Math.round(imgHeight * (512 / 710));

        ctx.save();
        try {
            // 소수점 좌표를 정수로 스냅: translate 자체가 소수점이면 모든 drawImage가 틀어짐
            ctx.translate(Math.round(this.x), Math.round(this.y));
            ctx.scale(s, s);
            
            if (!this.isAlive) {
                ctx.filter = 'grayscale(1)';
            }

            const dx = Math.round(-imgWidth / 2);
            const dy = Math.round(-imgHeight / 2);

            // 1. 뒷머리 (FH 코드에서 성별 자동 매칭: mFHa→mBHa, fFHa→fBHa)
            const fhCodeForBH = this.visuals.frontHair;
            if (fhCodeForBH) {
                const bhCode = (fhCodeForBH.startsWith('mFH') ? 'mBH' : 'fBH') + fhCodeForBH.slice(3);
                const bhImg = characterAssets.backHair[bhCode];
                if (bhImg && bhImg.complete && bhImg.naturalWidth)
                    ctx.drawImage(bhImg, dx, dy, imgWidth, imgHeight);
            }

            // 2. 어깨
            const shoulderImg = characterAssets.shoulder[this.visuals.shoulder || 'SA'];
            if (shoulderImg && shoulderImg.complete && shoulderImg.naturalWidth)
                ctx.drawImage(shoulderImg, dx, dy, imgWidth, imgHeight);

            // 3. 옷 (어깨 위)
            const clothesImg2 = characterAssets.clothes[this.visuals.clothes || 'CA'];
            if (clothesImg2 && clothesImg2.complete && clothesImg2.naturalWidth)
                ctx.drawImage(clothesImg2, dx, dy, imgWidth, imgHeight);

            // 4. 얼굴
            const faceType = this.visuals.face || 'Fa';
            const faceImg = characterAssets.face[faceType];
            if (faceImg && faceImg.complete && faceImg.naturalWidth) {
                ctx.drawImage(faceImg, dx, dy, imgWidth, imgHeight);
            }
            
            // 입
            const mouthCode = this.visuals.mouth || 'Ma';
            const mouthImg = characterAssets.mouth[mouthCode];
            if (mouthImg && mouthImg.complete && mouthImg.naturalWidth)
                ctx.drawImage(mouthImg, dx, dy, imgWidth, imgHeight);
            
            // 코
            const noseCode = this.visuals.nose || 'Na';
            const noseImg = characterAssets.nose[noseCode];
            if (noseImg && noseImg.complete && noseImg.naturalWidth)
                ctx.drawImage(noseImg, dx, dy, imgWidth, imgHeight);
            
            // 눈
            const eyesCode = this.visuals.eyes || 'Ea';
            const eyesImg = characterAssets.eyes[eyesCode];
            if (eyesImg && eyesImg.complete && eyesImg.naturalWidth)
                ctx.drawImage(eyesImg, dx, dy, imgWidth, imgHeight);
            
            // 앞머리 (얼굴 위)
            const fhCode = this.visuals.frontHair;
            if (fhCode) {
                const fhImg = characterAssets.frontHair[fhCode];
                if (fhImg && fhImg.complete && fhImg.naturalWidth)
                    ctx.drawImage(fhImg, dx, dy, imgWidth, imgHeight);
            }

            // 왕관
            if (this.isHead && this.isAlive && crownImg.complete && crownImg.naturalWidth) {
                const crownScale = imgHeight / 710 * 0.9;
                const cw = Math.round(crownImg.naturalWidth * crownScale);
                const ch = Math.round(crownImg.naturalHeight * crownScale);
                ctx.drawImage(crownImg, -cw / 2, -this.radius - 10 - ch / 2, cw, ch);
            }

            // 월급/지출 표시 (이미지 상단)
            if (this.isAlive && this.isMain) {
                ctx.font = "bold 13px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                const income = this.jobMonthlyIncomeKrw || 0;
                const expense = (typeof getFixedMonthlyExpenseKrw === 'function') ? getFixedMonthlyExpenseKrw(this.age) : 0;
                const net = income - expense;
                const netText = `${net >= 0 ? '+' : ''}${Math.floor(net / 10000)}만/월`;
                const tw = ctx.measureText(netText).width;
                const padX = 8, padY = 5;
                const bx = -tw / 2 - padX;
                const by = dy - 14 - 13 - padY;
                const bw = tw + padX * 2;
                const bh = 13 + padY * 2;
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#aaaaaa";
                ctx.lineWidth = 2;
                if (ctx.roundRect) {
                    ctx.beginPath();
                    ctx.roundRect(bx, by, bw, bh, 7);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillRect(bx, by, bw, bh);
                    ctx.strokeRect(bx, by, bw, bh);
                }
                ctx.fillStyle = net >= 0 ? "#27ae60" : "#e74c3c";
                ctx.fillText(netText, 0, dy - 14);
            }

            // 텍스트: 이름 및 나이 (이미지 하단 기준으로 간격 확보)
            let startY = Math.round(imgHeight / 2) + 30;
            ctx.fillStyle = "#2d3436";
            ctx.font = "bold 18px sans-serif";
            ctx.textAlign = "center";
            let diseaseIcon = this.disease ? " 🤒" : "";
            const jobLabel = this.jobName || (this.careerStage === 'retired' ? '은퇴' : '무직');
            ctx.fillText(`${this.name}(${this.age}) · ${jobLabel}${diseaseIcon}`, 0, startY);
            
            // 텍스트: 특성
            startY += 12;
            ctx.font = "bold 13px sans-serif";
            ctx.textBaseline = "middle";

            const traitsList = [
                { prefix: '외', ...this.traits.app },
                { prefix: '성', ...this.traits.per },
                { prefix: '가', ...this.traits.val },
                { prefix: '건', ...this.traits.hlt }
            ];

            traitsList.forEach((t, i) => {
                if (!t.name) return;
                const text = `[${t.prefix}] ${t.name}`;
                const boxWidth = 88;     // 고정 너비 (통일)

                // 2×2 배치: 짝수=왼쪽, 홀수=오른쪽
                const col = i % 2;       // 0: 왼쪽, 1: 오른쪽
                const row = Math.floor(i / 2);
                const boxH = 20;
                const rowGap = 26;
                const colGap = 4;        // 좌우 박스 사이 간격
                const boxY = startY + row * rowGap;
                const boxX = col === 0 ? -(colGap / 2) - boxWidth : (colGap / 2);

                ctx.fillStyle = getTierColor(t.tier);
                if (ctx.roundRect) {
                    ctx.beginPath();
                    ctx.roundRect(boxX, boxY, boxWidth, boxH, 6);
                    ctx.fill();
                } else {
                    ctx.fillRect(boxX, boxY, boxWidth, boxH);
                }
                // 텍스트가 박스 내 수평 중앙에 표시
                ctx.fillStyle = "#ffffff";
                ctx.fillText(text, boxX + boxWidth / 2, boxY + boxH / 2);
            });
        } catch (e) {
            console.error(`[draw] ${this.name} 오류:`, e);
        } finally {
            ctx.restore();
        }
    }
}