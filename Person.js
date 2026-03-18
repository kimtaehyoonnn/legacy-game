// Person.js

// 💡 1. 게임 시작 시 이미지를 미리 메모리에 로딩합니다. (딱 한 번만 실행)
const assetImages = {
  FaceA: new Image(),
  EyeA: new Image(),
  NoseA: new Image(),
  MouthA: new Image(),
  HairA: new Image() // 대표님 요청하신 머리카락 추가!
};

// 이미지 파일 위치 지정 (띄어쓰기 없는 버전!)
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
    this.size = size; // 캐릭터 기본 크기 (40픽셀 정육면체 크기로 렌더링)
    this.isSelected = false;
  }

  // 💡 2. 기존의 파란 네모 그리기 명령을 지우고, 이미지 렌더링으로 교체합니다.
  draw(ctx) {
    // 선택되었을 때만 그리는 파란색 강조 테두리 (이건 살려둡니다)
    if (this.isSelected) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 2, this.y - 2, this.size + 4, this.size + 4);
    }

    // ★ 진짜 캐릭터 조립하기 ★
    // 파트너분이 투명 PNG로 주셨으니, 그냥 순서대로 겹쳐서 그리면 됩니다!
    
    // 1층: 얼굴 베이스 (가장 밑바닥)
    ctx.drawImage(assetImages.FaceA, this.x, this.y, this.size, this.size);
    
    // 2층: 이목구비 (눈, 코, 입)
    ctx.drawImage(assetImages.MouthA, this.x, this.y, this.size, this.size);
    ctx.drawImage(assetImages.NoseA, this.x, this.y, this.size, this.size);
    ctx.drawImage(assetImages.EyeA, this.x, this.y, this.size, this.size);
    
    // 3층: 머리카락 (가장 위)
    ctx.drawImage(assetImages.HairA, this.x, this.y, this.size, this.size);

    // 이름표 그리기 (이건 그대로 살려둡니다)
    ctx.fillStyle = "black";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x + this.size / 2, this.y + this.size + 15);
  }

  // (다른 함수들은 그대로 둡니다...)
  update() {
    // 움직임 관련 코드...
  }

  isClicked(mx, my) {
    // 클릭 체크...
    return mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size;
  }
}