function getFixedMonthlyExpenseKrw(age) {
    const normalizedAge = Number.isFinite(age) ? Math.max(0, Math.floor(age)) : 0;
    if (normalizedAge < 20) return 1_000_000;
    if (normalizedAge < 30) return 1_500_000;
    if (normalizedAge < 55) return 2_500_000;
    if (normalizedAge < 70) return 1_500_000;
    return 1_000_000;
}

function getFixedMonthlyIncomeKrw(person) {
    if (!person || !Number.isFinite(person.jobMonthlyIncomeKrw)) return 0;
    return person.jobMonthlyIncomeKrw;
}

function isAliveAndValidInGameFamilyMember(person) {
    return !!person && person.isAlive && person.isMain;
}

const MAX_FLOATING_TEXTS = 200;

function settleMonthlyFamilyAsset() {
    let monthlyCashflowKrw = 0;
    let aliveMainCount = 0;
    for (let i = 0; i < nodes.length; i++) {
        const person = nodes[i];
        if (!isAliveAndValidInGameFamilyMember(person)) continue;
        aliveMainCount++;
        const income = getFixedMonthlyIncomeKrw(person);
        const expense = getFixedMonthlyExpenseKrw(person.age);
        const net = income - expense;
        monthlyCashflowKrw += net;
        // 📌 플로팅 텍스트 제한: 배열이 너무 커지면 스폰 중단
        if (floatingTexts.length < MAX_FLOATING_TEXTS) {
            const netMan = Math.floor(net / 10000);
            if (netMan !== 0) {
                floatingTexts.push({
                    person: person,
                    offsetY: 0,
                    text: `${net > 0 ? '+' : ''}${netMan}만`,
                    color: net > 0 ? '#27ae60' : '#e74c3c',
                    alpha: 1
                });
            }
        }
    }
    lastMonthlyCashflowKrw = monthlyCashflowKrw;
    familyAssetKrw += monthlyCashflowKrw;
    _cachedAliveCount = aliveMainCount;
}

function formatKoreanMoneyUnits(amountKrw) {
    const safeAmount = Number.isFinite(amountKrw) ? Math.trunc(amountKrw) : 0;
    const isNegative = safeAmount < 0;
    let remaining = Math.abs(safeAmount);

    const units = [
        { value: 1_000_000_000_000, label: '조' },
        { value: 100_000_000, label: '억' },
        { value: 10_000, label: '만' }
    ];

    const parts = [];
    for (const unit of units) {
        if (remaining < unit.value) continue;
        const amount = Math.floor(remaining / unit.value);
        parts.push(`${amount.toLocaleString('ko-KR')}${unit.label}`);
        remaining %= unit.value;
    }

    if (remaining > 0 || parts.length === 0) {
        parts.push(`${remaining.toLocaleString('ko-KR')}원`);
    } else {
        const lastIndex = parts.length - 1;
        parts[lastIndex] = `${parts[lastIndex]}원`;
    }

    return `${isNegative ? '-' : ''}${parts.join(' ')}`;
}
