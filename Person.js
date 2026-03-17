const NAMES = { M: ["강민", "준호", "도윤", "시우", "태양", "지훈", "현우", "건우", "민재", "지한"], F: ["서연", "민서", "지아", "하윤", "아린", "수아", "유나", "지윤", "예원", "다인"] };

const TRAITS = {
    app: { SSR: ["절세미인", "조각 미남", "신의 피조물"], SR: ["수려한 외모", "우아한 기품", "매혹적 눈빛"], R: ["매력적 인상", "단정한 외모", "귀여운 얼굴"], N: ["평범한 외모", "각진 얼굴", "주근깨"] },
    per: { SSR: ["성인군자", "완벽한 리더십", "강철 멘탈"], SR: ["압도적 카리스마", "천재적 영감", "불굴의 의지"], R: ["다정다감", "사교적 성격", "침착함"], N: ["평범한 성격", "다혈질", "소심함"] },
    val: { SSR: ["순백의 이타주의", "진리의 탐구자", "구원자"], SR: ["원대한 야망", "완벽주의", "자유로운 영혼"], R: ["가족애", "평화주의자", "모험가"], N: ["물질만능주의", "쾌락주의", "현실주의"] },
    hlt: { SSR: ["금강불괴", "불로장생", "신성한 육신"], SR: ["강철 체력", "왕성한 활력", "타고난 면역력"], R: ["평범한 체력", "무난한 건강", "잔병치레 없음"], N: ["허약 체질", "걸어다니는 병원", "유리몸"] }
};

const VISUAL_PARTS = {
    eyes: { SSR: ["Ea"], SR: ["Eb"], R: ["Ec"], N: ["Ed"] },
    nose: { SSR: ["Na"], SR: ["Nb"], R: ["Nc"], N: ["Nd"] },
    mouth: { SSR: ["Ma"], SR: ["Mb"], R: ["Mc"], N: ["Md"] },
    face: { SSR: ["Fa"], SR: ["Fb"], R: ["Fc"], N: ["Fd"] }
};

function getTierColor(tier) {
    if(tier === 'SSR') return '#e67e22'; if(tier === 'SR') return '#9b59b6';
    if(tier === 'R') return '#2980b9'; return '#7f8c8d';
}

function getRandomTrait(category) {
    const rand = Math.random();
    const tier = rand < 0.03 ? 'SSR' : (rand < 0.15 ? 'SR' : (rand < 0.45 ? 'R' : 'N'));
    const list = TRAITS[category][tier];
    return { tier, name: list[Math.floor(Math.random() * list.length)] };
}

function getRandomVisualPart(partName) {
    const rand = Math.random();
    const tier = rand < 0.03 ? 'SSR' : (rand < 0.15 ? 'SR' : (rand < 0.45 ? 'R' : 'N'));
    const list = VISUAL_PARTS[partName][tier];
    return { tier, name: list[Math.floor(Math.random() * list.length)] };
}

function getRandomVisuals() {
    return {
        eyes: getRandomVisualPart('eyes'),
        nose: getRandomVisualPart('nose'),
        mouth: getRandomVisualPart('mouth'),
        face: getRandomVisualPart('face')
    };
}

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
        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;

        if (this.isAlive && !isEventActive && currentSpeed > 0) this.pulse += 0.05 * currentSpeed;
        const s = this.isAlive ? 1 + Math.sin(this.pulse) * 0.03 : 1;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(s, s);
        
        if (!this.isAlive) ctx.globalAlpha = 0.3;
        else if (!this.isMain) ctx.globalAlpha = 0.3; 
        
        ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.gender === 'M' ? "#4a69bd" : "#ff7979";
        ctx.fill(); ctx.strokeStyle = "white"; ctx.lineWidth = 5; ctx.stroke();
        
        if (this.isAlive && this.visuals.eyes && this.visuals.nose && this.visuals.mouth && this.visuals.face) {
            ctx.save();
            ctx.scale(scale, scale);

            ctx.fillStyle = getTierColor(this.visuals.eyes.tier);
            const eyeSize = 10; const eyeOffset = 20;
            ctx.beginPath(); ctx.arc(-eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = getTierColor(this.visuals.nose.tier);
            const noseSize = 15;
            ctx.beginPath(); ctx.moveTo(0, -noseSize / 2); ctx.lineTo(-noseSize / 2, noseSize / 2); ctx.lineTo(noseSize / 2, noseSize / 2); ctx.closePath(); ctx.fill();

            ctx.fillStyle = getTierColor(this.visuals.mouth.tier);
            const mouthWidth = 30; const mouthHeight = 10; const mouthOffset = 15;
            ctx.fillRect(-mouthWidth / 2, mouthOffset, mouthWidth, mouthHeight);

            ctx.strokeStyle = getTierColor(this.visuals.face.tier);
            ctx.lineWidth = 3;
            const faceSize = this.radius * 1.2;
            ctx.beginPath();
            if (this.visuals.face.tier === 'SSR') {
                ctx.arc(0, 0, faceSize, 0, Math.PI * 2);
            } else if (this.visuals.face.tier === 'SR') {
                ctx.moveTo(0, -faceSize); ctx.lineTo(-faceSize * Math.sqrt(3) / 2, faceSize / 2); ctx.lineTo(faceSize * Math.sqrt(3) / 2, faceSize / 2); ctx.closePath();
            } else {
                ctx.rect(-faceSize / 2, -faceSize / 2, faceSize, faceSize);
            }
            ctx.stroke();

            ctx.restore();
        }

        if (this.isHead && this.isAlive) {
            ctx.font = "24px sans-serif";
            ctx.fillText("👑", 0, -this.radius - 10);
        }

        let startY = this.radius + 20;
        ctx.fillStyle = "#2d3436"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
        
        let diseaseIcon = "";
        if (this.isAlive && this.disease) {
            if (this.disease === '감기') diseaseIcon = " 🤧";
            if (this.disease === '몸살') diseaseIcon = " 🤒";
            if (this.disease === '혼절') diseaseIcon = " 🤕";
        }
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