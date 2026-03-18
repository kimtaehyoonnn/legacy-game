// Person.js 상단에 필요한 변수들을 안전하게 선언합니다.
let nextId = typeof nextId === 'undefined' ? 0 : nextId;
let currentSpeed = typeof currentSpeed === 'undefined' ? 1 : currentSpeed;
let isEventActive = typeof isEventActive === 'undefined' ? false : isEventActive;

// 💡 이미지 에셋 로딩 (대소문자/이름 주의!)
const characterAssets = {
    face: new Image(),
    eyes: new Image(),
    nose: new Image(),
    mouth: new Image(),
    hair: new Image()
};

// 깃허브에 올린 파일명과 100% 일치해야 합니다.
characterAssets.face.src = "images/FaceA.png";
characterAssets.eyes.src = "images/EyeA.png";
characterAssets.nose.src = "images/NoseA.png";
characterAssets.mouth.src = "images/MouthA.png";
characterAssets.hair.src = "images/HairA.png";

const NAMES = { M: ["강민", "준호", "도윤", "시우", "태양", "지훈", "현우", "건우", "민재", "지한"], F: ["서연", "민서", "지아", "하윤", "아린", "수아", "유나", "지윤", "예원", "다인"] };

function getTierColor(tier) {
    if(tier === 'SSR') return '#e67e22'; if(tier === 'SR') return '#9b59b6';
    if(tier === 'R') return '#2980b9'; return '#7f8c8d';
}

class PersonNode {
    constructor(name, gender, x, y, level, age = 0, parents = [], isHead = false, isMain = true, isSpouse = false) {
        this.id = nextId++; 
        this.name = name; 
        this.gender = gender;
        this.x = x; this.y = y; 
        this.targetX = x; this.targetY = y; 
        this.level = level; this.age = age;
        this.parents = parents; this.isAlive = true; this.partner = null;
        this.isMarried = false; 
        this.radius = 48; 
        this.pulse = Math.random() * 10;
        this.children = [];
        this.isHead = isHead; this.isMain = isMain; this.isSpouse = isSpouse; 
        
        this.menopauseAge = this.gender === 'F' ? Math.floor(Math.random() * 7) + 47 : null;
        this.disease = null;
        
        // 💡 null 에러 방지를 위해 기본값 설정
        this.traits = { 
            app: { tier: 'N', name: '평범한 외모' }, 
            per: { tier: 'N', name: '평범한 성격' }, 
            val: { tier: 'N', name: '현실주의' }, 
            hlt: { tier: 'N', name: '평범한 체력' } 
        };
        this.visuals = { eyes: 'Ea', nose: 'Na', mouth: 'Ma', face: 'Fa' };
    }

    // 💡 scale이 안 넘어와도 기본값 1을 쓰도록 수정
    draw(ctx, scale = 1) {
        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;

        if (this.isAlive && !isEventActive && currentSpeed > 0) this.pulse += 0.05 * currentSpeed;
        const s = this.isAlive ? 1 + Math.sin(this.pulse) * 0.03 : 1;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(s, s);
        
        if (!this.isAlive || !this.isMain) ctx.globalAlpha = 0.3;

        // 💡 캐릭터 본체 그리기
        const imgSize = this.radius * 2;
        
        if (characterAssets.face.complete && characterAssets.face.naturalWidth !== 0) {
            // 이미지가 준비되었다면 이미지로 조립
            ctx.drawImage(characterAssets.face, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.mouth, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.nose, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.eyes, -this.radius, -this.radius, imgSize, imgSize);
            ctx.drawImage(characterAssets.hair, -this.radius, -this.radius, imgSize, imgSize);
        } else {
            // 💡 이미지가 아직 안 왔다면 원형이라도 그려서 "살아있음"을 증명!
            ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.gender === 'M' ? "#4a69bd" : "#ff7979";
            ctx.fill(); 
            ctx.strokeStyle = "white"; ctx.lineWidth = 5; ctx.stroke();
        }

        if (this.isHead && this.isAlive) {
            ctx.font = "24px sans-serif";
            ctx.fillText("👑", 0, -this.radius - 10);
        }

        // 하단 텍스트 및 특성 UI
        let startY = this.radius + 20;
        ctx.fillStyle = "#2d3436"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
        let diseaseIcon = this.disease ? " 🤒" : "";
        ctx.fillText(`${this.name}(${this.age})${diseaseIcon}`, 0, startY);
        
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
            if(!t.name) return;
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
        
        ctx.restore();
    }

    update(canvasWidth, canvasHeight) {
        // 화면 밖으로 나가지 않게 타겟 위치 조정 (기존 로직이 있다면 거기 맞춰주세요)
        if (this.targetX < 0) this.targetX = 0;
        if (this.targetX > canvasWidth) this.targetX = canvasWidth;
        if (this.targetY < 0) this.targetY = 0;
        if (this.targetY > canvasHeight) this.targetY = canvasHeight;
    }
}