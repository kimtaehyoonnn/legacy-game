// Person.js

// 💡 1. 이미지 에셋 미리 로딩 (이미지 파일 이름에 띄어쓰기 없어야 함!)
const characterAssets = {
    eyes: new Image(),
    nose: new Image(),
    mouth: new Image(),
    face: new Image(),
    hair: new Image()
};

// 대표님이 가지고 계신 'A' 세트 이미지들로 연결합니다.
characterAssets.eyes.src = "images/EyeA.png";
characterAssets.nose.src = "images/NoseA.png";
characterAssets.mouth.src = "images/MouthA.png";
characterAssets.face.src = "images/FaceA.png";
characterAssets.hair.src = "images/HairA.png";

// (기존 변수들 유지)
const NAMES = { M: ["강민", "준호", "도윤", "시우", "태양", "지훈", "현우", "건우", "민재", "지한"], F: ["서연", "민서", "지아", "하윤", "아린", "수아", "유나", "지윤", "예원", "다인"] };
// ... (TRAITS, VISUAL_PARTS 등 기존 데이터 생략 - 실제 파일엔 그대로 두세요!)

// 💡 수술 시작: PersonNode 클래스
class PersonNode {
    constructor(name, gender, x, y, level, age = 0, parents = [], isHead = false, isMain = true, isSpouse = false) {
        this.id = nextId++; this.name = name; this.gender = gender;
        this.x = x; this.y = y; this.targetX = x; this.targetY = y; 
        this.level = level; this.age = age;
        this.parents = parents; this.isAlive = true; this.partner = null;
        this.isMarried = false; this.radius = 48; this.pulse = Math.random() * 10;
        this.children = [];
        this.isHead = isHead; this.isMain = isMain; this.isSpouse = isSpouse; 
        
        this.menopauseAge = this.gender === 'F' ? Math.floor(Math.random() * 7) + 47 : null;
        this.disease = null;
        
        this.traits = { app: null, per: null, val: null, hlt: null };
        this.visuals = { eyes: null, nose: null, mouth: null, face: null };
    }

    draw(ctx, scale) {
        // 이동 및 애니메이션 로직 유지
        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;

        if (this.isAlive && !isEventActive && currentSpeed > 0) this.pulse += 0.05 * currentSpeed;
        const s = this.isAlive ? 1 + Math.sin(this.pulse) * 0.03 : 1;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(s, s);
        
        if (!this.isAlive) ctx.globalAlpha = 0.3;
        else if (!this.isMain) ctx.globalAlpha = 0.3; 

        // 💡 [수술 부위] 기존 원형/도형 그리기 대신 이미지를 겹쳐 그립니다.
        const imgSize = this.radius * 2; // 캐릭터 반지름의 2배 크기로 이미지 출력
        
        // 이미지가 로딩 완료되었을 때만 그립니다. (에러 방지)
        if (characterAssets.face.complete) {
            // 순서: 얼굴 -> 입 -> 코 -> 눈 -> 머리카락
            ctx.drawImage(characterAssets.face, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.mouth, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.nose, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.eyes, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.hair, -this.radius, -this.radius, imgSize, imgSize);
        } else {
            // 이미지 로딩 전에는 기존처럼 원이라도 그려서 표시합니다.
            ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.gender === 'M' ? "#4a69bd" : "#ff7979";
            ctx.fill();
        }

        // 👑 왕관 표시 (가주)
        if (this.isHead && this.isAlive) {
            ctx.font = "24px sans-serif";
            ctx.fillText("👑", 0, -this.radius - 10);
        }

        // 하단 UI (이름, 나이, 질병, 특성 박스) 로직 100% 유지
        let startY = this.radius + 20;
        ctx.fillStyle = "#2d3436"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
        
        let diseaseIcon = "";
        if (this.isAlive && this.disease) {
            if (this.disease === '감기') diseaseIcon = " 🤧";
            if (this.disease === '몸살') diseaseIcon = " 🤒";
            if (this.disease === '혼절') diseaseIcon = " 🤕";
        }
        ctx.fillText(`${this.name}(${this.age})${diseaseIcon}`, 0, startY);
        
        // ... (이후 특성 박스 그리는 코드는 대표님의 원본과 동일하게 유지)
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
            if(!t.name) return; // 데이터가 없을 때 방어 코드
            const text = `[${t.prefix}] ${t.name}`;
            const textWidth = ctx.measureText(text).width;
            const boxWidth = textWidth + 16; 
            const boxHeight = 20;
            const boxY = startY + (i * 24); 
            
            ctx.fillStyle = getTierColor(t.tier);
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-boxWidth / 2, boxY, boxWidth, boxHeight, 6);
            else ctx.rect(-boxWidth / 2, boxY, boxWidth, boxHeight);
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.fillText(text, 0, boxY + boxHeight / 2);
        });
        
        ctx.restore();
    }
}