// 💡 특성 데이터 정의
const TRAITS_DATA = {
    app: [
        { tier: 'SSR', name: '절세미인' },
        { tier: 'SSR', name: '꽃미남' },
        { tier: 'SR', name: '잘생긴편' },
        { tier: 'SR', name: '예쁜편' },
        { tier: 'R', name: '괜찮은외모' },
        { tier: 'R', name: '평범한외모' }
    ],
    per: [
        { tier: 'SSR', name: '강단 있음' },
        { tier: 'SSR', name: '따뜻한마음' },
        { tier: 'SR', name: '신중함' },
        { tier: 'SR', name: '적극적' },
        { tier: 'R', name: '소심함' },
        { tier: 'R', name: '평범한성격' }
    ],
    val: [
        { tier: 'SSR', name: '명예심강함' },
        { tier: 'SSR', name: '의리있음' },
        { tier: 'SR', name: '현실주의' },
        { tier: 'SR', name: '낙관주의' },
        { tier: 'R', name: '이기주의' },
        { tier: 'R', name: '무관심' }
    ],
    hlt: [
        { tier: 'SSR', name: '철강체' },
        { tier: 'SSR', name: '건강함' },
        { tier: 'SR', name: '보통체력' },
        { tier: 'SR', name: '약간약함' },
        { tier: 'R', name: '허약체질' },
        { tier: 'R', name: '병약함' }
    ]
};

function getRandomTrait(category) {
    if (!TRAITS_DATA[category]) return { tier: 'N', name: '평범함' };
    const traits = TRAITS_DATA[category];
    return traits[Math.floor(Math.random() * traits.length)];
}
