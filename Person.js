// Person.js

const assetImages = {
  FaceA: new Image(),
  EyeA: new Image(),
  NoseA: new Image(),
  MouthA: new Image(),
  HairA: new Image()
};

// 💡 띄어쓰기 없는 주소. 대소문자가 실제 파일과 100% 똑같아야 합니다!
assetImages.FaceA.src = "images/FaceA.png";
assetImages.EyeA.src = "images/EyeA.png";
assetImages.NoseA.src = "images/NoseA.png";
assetImages.MouthA.src = "images/MouthA.png";
assetImages.HairA.src = "images/HairA.png";

class Person {
  constructor(name, x, y, size = 40) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.isSelected = false;
    
    // 캐릭터 이동 속도
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
  }

  draw(ctx) {
    // 💡 1. 이미지가 깨져도 게임이 멈추지 않게 기본 도형(회색)을 먼저 깔아둡니다.
    ctx.fillStyle = "#dddddd";
    ctx.fillRect(this.x, this.y, this.size, this.size);

    // 💡 2. 에러 방지 보호막(try-catch) 안에서 이미지를 그립니다.
    try {
      // 이미지가 정상적으로 로딩되었을 때만 그리기!
      if(assetImages.FaceA.complete && assetImages.FaceA.naturalWidth !== 0) {
        ctx.drawImage(assetImages.FaceA, this.x, this.y, this.size, this.size);
        ctx.drawImage(assetImages.MouthA, this.x, this.y, this.size, this.size);
        ctx.drawImage(assetImages.NoseA, this.x, this.y, this.size, this.size);
        ctx.drawImage(assetImages.EyeA, this.x, this.y, this.size, this.size);
        ctx.drawImage(assetImages.HairA, this.x, this.y, this.size, this.size);
      }
    } catch (error) {
       // 이미지를 못 찾아도 게임을 멈추지 않고 조용히 무시합니다.
    }

    // 이름표
    ctx.fillStyle = "black";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x + this.size / 2, this.y + this.size + 15);
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x + this.size > canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y + this.size > canvasHeight) this.vy *= -1;
  }

  isClicked(mx, my) {
    return mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size;
  }
}