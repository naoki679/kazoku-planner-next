'use client';

interface NeedBoxProps {
  minEduMonthly: number;
  minRetireMonthly: number;
  currentEdu: number;
  currentRetire: number;
}

export default function NeedBox({ minEduMonthly, minRetireMonthly, currentEdu, currentRetire }: NeedBoxProps) {
  const minTotal = minEduMonthly + minRetireMonthly;
  const currentTotal = currentEdu + currentRetire;
  const diff = currentTotal - minTotal;

  function Item({ label, min, current, sub }: { label: string; min: number; current: number; sub: string }) {
    const ok = current >= min;
    return (
      <div style={{ textAlign: 'center', padding: '8px 4px' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: ok ? 'var(--green)' : '#b45309' }}>
          {Math.ceil(min * 10) / 10}万円/月
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      border: '1px solid #93c5fd',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 20,
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
    }}>
      <Item label="教育費 最低必要月額" min={minEduMonthly} current={currentEdu} sub="4人合計の最低ライン" />
      <Item label="老後資金 最低必要月額" min={minRetireMonthly} current={currentRetire} sub="2060年までに達成する月額" />
      <div style={{ textAlign: 'center', padding: '8px 4px' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>合計最低必要月額</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: diff >= 0 ? 'var(--green)' : '#b45309' }}>
          {Math.ceil(minTotal * 10) / 10}万円/月
        </div>
        <div style={{ fontSize: 10, color: diff >= 0 ? 'var(--green)' : '#b45309', marginTop: 2, fontWeight: 700 }}>
          {diff >= 0
            ? `月${diff.toFixed(1)}万円 余裕あり ✅`
            : `月${Math.abs(diff).toFixed(1)}万円 不足 ⚠️`}
        </div>
      </div>
    </div>
  );
}
