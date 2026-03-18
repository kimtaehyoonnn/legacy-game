// 💡 1. 게임 시작 시 이미지를 미리 메모리에 로딩합니다.
const assetImages = {
  FaceA: new Image(),
  EyeA: new Image(),
  NoseA: new Image(),
  MouthA: new Image(),
  HairA: new Image()
};

// 이미지 파일 위치 (띄어쓰기 없는 버전!)
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
    this.size = size; // 캐릭터 크기
    this.isSelected = false;
    
    // 캐릭터가 뽈뽈거리며 돌아다닐 속도 (랜덤)
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
  }

  // 💡 2. 캐릭터 그리기 (이미지 에셋 조립)
  draw(ctx) {
    // 선택되었을 때 파란색 테두리
    if (this.isSelected) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 2, this.y - 2, this.size + 4, this.size + 4);
    }

    // 1층~3층 이미지 순서대로 겹쳐 그리기
    ctx.drawImage(assetImages.FaceA, this.x, this.y, this.size, this.size);
    ctx.drawImage(assetImages.MouthA, this.x, this.y, this.size, this.size);
    ctx.drawImage(assetImages.NoseA, this.x, this.y, this.size, this.size);
    ctx.drawImage(assetImages.EyeA, this.x, this.y, this.size, this.size);
    ctx.drawImage(assetImages.HairA, this.x, this.y, this.size, this.size);

    // 이름표 달아주기
    ctx.fillStyle = "black";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x + this.size / 2, this.y + this.size + 15);
  }

  // 💡 3. 캐릭터 움직임 엔진 (이게 날아가서 화면이 멈췄던 겁니다!)
  update(canvasWidth, canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;

    // 화면(캔버스) 벽에 부딪히면 반대로 튕겨 나오기
    if (this.x < 0 || this.x + this.size > canvasWidth) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y + this.size > canvasHeight) {
      this.vy *= -1;
    }
  }

  // 💡 4. 마우스 클릭 감지
  isClicked(mx, my) {
    return mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size;
  }
}