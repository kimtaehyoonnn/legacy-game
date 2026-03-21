// 💡 에셋 설정 (추후 NoseB~NoseE 등 추가 시 여기만 수정)
const ASSET_CONFIG = {
    eyes: { count: 5, prefix: 'Eye' },      // EyeA~EyeE (5가지)
    nose: { count: 5, prefix: 'Nose' },     // NoseA~NoseE (5가지)
    mouth: { count: 5, prefix: 'Mouth' },   // MouthA~MouthE (5가지)
    hair: { count: 5, prefix: 'Hair' },     // HairA~HairE (5가지)
    clothes: { count: 5, prefix: 'Clothes' } // ClothesA~ClothesE (5가지)
};

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
    hair: {},
    clothes: {}
};

// 로드된 이미지 개수 추적
let imagesLoaded = 0;
let totalImages = FACE_CONFIG.count + 
                  Object.values(ASSET_CONFIG).reduce((sum, cfg) => sum + cfg.count, 0);

console.log(`[이미지 로드] 총 ${totalImages}개 에셋 로드 예정...`);

// 🔄 동적 이미지 로드 함수
function loadImage(src, onLoad, onError) {
    const img = new Image();
    img.onload = () => {
        console.log(`[이미지 로드] ${src} OK - ${img.naturalWidth}x${img.naturalHeight}`);
        onLoad();
    };
    img.onerror = () => {
        console.error(`[이미지 오류] ${src} 실패 - 파일 없거나 손상됨`);
        onError();
    };
    img.src = src;
    return img;
}

// 1️⃣ 얼굴 이미지 로드
FACE_CONFIG.types.forEach(faceType => {
    characterAssets.face[faceType] = loadImage(
        `images/${faceType}.png`,
        () => {
            imagesLoaded++;
            const img = characterAssets.face[faceType];
            console.log(`[Face 로드] ${faceType}.png 완료 (${imagesLoaded}/${totalImages}) - 크기: ${img.naturalWidth}x${img.naturalHeight}`);
        },
        () => {
            console.warn(`[Face 오류] ${faceType}.png 실패`);
        }
    );
});

// 2️⃣ 다른 에셋 로드
Object.entries(ASSET_CONFIG).forEach(([assetType, config]) => {
    for (let i = 0; i < config.count; i++) {
        const letter = String.fromCharCode(97 + i); // 0→a, 1→b, ... (소문자!)
        const prefix = assetType === 'eyes' ? 'E' :
                      assetType === 'nose' ? 'N' :
                      assetType === 'mouth' ? 'M' :
                      assetType === 'hair' ? 'H' :
                      assetType === 'clothes' ? 'C' : '';
        
        const code = `${prefix}${letter.toUpperCase()}`; // Ea, Eb, ... or Na, Nb, ...
        const filename = `${prefix}${letter}`; // ea, eb, ... or na, nb, ...
        
        characterAssets[assetType][code] = loadImage(
            `images/${filename}.png`,
            () => {
                imagesLoaded++;
                console.log(`[이미지 로드] ${filename}.png 완료 (${imagesLoaded}/${totalImages})`);
            },
            () => {
                console.warn(`[이미지 오류] ${filename}.png 실패`);
            }
        );
    }
});

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
        this.pulse = Math.random() * 10;
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
                this.visuals = { eyes: 'Ea', nose: 'Na', mouth: 'Ma', face: 'Fa', hair: 'Ha', clothes: 'Ca' };

        console.log(`[PersonNode] ID:${this.id}, 이름:${name}, 초기좌표:(${this.x},${this.y}), targetX:${this.targetX}, targetY:${this.targetY}`);
    }

    draw(ctx, scale = 1) {
        // 좌표 유효성 검증
        if (typeof this.x !== 'number' || isNaN(this.x) || typeof this.y !== 'number' || isNaN(this.y)) {
            return;
        }

        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;

        if (this.isAlive && !isEventActive && currentSpeed > 0) this.pulse += 0.05 * currentSpeed;
        const s = this.isAlive ? 1 + Math.sin(this.pulse) * 0.03 : 1;

        // 이미지 비율 512×710 유지 (30% 확대)
        const imgHeight = this.radius * 2.6;
        const imgWidth = imgHeight * (512 / 710);

        ctx.save();
        try {
            ctx.translate(this.x, this.y);
            ctx.scale(s, s);
            
            if (!this.isAlive || !this.isMain) ctx.globalAlpha = 0.3;

            // 전경: 이미지 그리기
            ctx.globalAlpha = 1;
            
            // 얼굴
            const faceType = this.visuals.face || 'Fa';
            const faceImg = characterAssets.face[faceType];
            if (faceImg && faceImg.complete && faceImg.naturalWidth) {
                ctx.drawImage(faceImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
                if (this.id === 0 && !window.faceRenderedOnce) {
                    console.log(`✅ [Face 렌더링] ${faceType} 성공`);
                    window.faceRenderedOnce = true;
                }
            } else if (this.id === 0 && !window.faceFailedOnce) {
                console.warn(`❌ [Face 렌더링] ${faceType} 실패 - complete: ${faceImg?.complete}, width: ${faceImg?.naturalWidth}`);
                window.faceFailedOnce = true;
            }
            
            // 입
            const mouthCode = this.visuals.mouth || 'Ma';
            const mouthImg = characterAssets.mouth[mouthCode];
            if (mouthImg && mouthImg.complete && mouthImg.naturalWidth)
                ctx.drawImage(mouthImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            
            // 코
            const noseCode = this.visuals.nose || 'Na';
            const noseImg = characterAssets.nose[noseCode];
            if (noseImg && noseImg.complete && noseImg.naturalWidth)
                ctx.drawImage(noseImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            
            // 눈
            const eyesCode = this.visuals.eyes || 'Ea';
            const eyesImg = characterAssets.eyes[eyesCode];
            if (eyesImg && eyesImg.complete && eyesImg.naturalWidth)
                ctx.drawImage(eyesImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            
            // 머리
            const hairCode = this.visuals.hair || 'Ha';
            const hairImg = characterAssets.hair[hairCode];
            if (hairImg && hairImg.complete && hairImg.naturalWidth)
                ctx.drawImage(hairImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

            // 옷
            const clothesCode = this.visuals.clothes || 'Ca';
            const clothesImg = characterAssets.clothes[clothesCode];
            if (clothesImg && clothesImg.complete && clothesImg.naturalWidth)
                ctx.drawImage(clothesImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

            // 왕관
            if (this.isHead && this.isAlive) {
                ctx.font = "24px sans-serif";
                ctx.fillText("👑", 0, -this.radius - 10);
            }

            // 텍스트: 이름 및 나이
            let startY = this.radius + 20;
            ctx.fillStyle = "#2d3436";
            ctx.font = "bold 15px sans-serif";
            ctx.textAlign = "center";
            let diseaseIcon = this.disease ? " 🤒" : "";
            const jobLabel = this.jobName || (this.careerStage === 'retired' ? '은퇴' : '무직');
            ctx.fillText(`${this.name}(${this.age}) · ${jobLabel}${diseaseIcon}`, 0, startY);
            
            // 텍스트: 특성
            startY += 12;
            ctx.font = "bold 11px sans-serif";
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
                const textWidth = ctx.measureText(text).width;
                const boxWidth = textWidth + 16;
                const boxY = startY + (i * 24);
                
                ctx.fillStyle = getTierColor(t.tier);
                if (ctx.roundRect) {
                    ctx.beginPath();
                    ctx.roundRect(-boxWidth / 2, boxY, boxWidth, 20, 6);
                    ctx.fill();
                } else {
                    ctx.fillRect(-boxWidth / 2, boxY, boxWidth, 20);
                }
                ctx.fillStyle = "#ffffff";
                ctx.fillText(text, 0, boxY + 10);
            });
        } catch (e) {
            console.error(`[draw] ${this.name} 오류:`, e);
        } finally {
            ctx.restore();
        }
    }

    update(canvasWidth, canvasHeight) {
        // 화면 밖으로 나가지 않게 타겟 위치 조정 (기존 로직이 있다면 거기 맞춰주세요)
        if (this.targetX < 0) this.targetX = 0;
        if (this.targetX > canvasWidth) this.targetX = canvasWidth;
        if (this.targetY < 0) this.targetY = 0;
        if (this.targetY > canvasHeight) this.targetY = canvasHeight;
    }
}