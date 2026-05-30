'use client';

import { RetireResult } from '@/lib/calculator';

interface GoalBannerProps {
  allEduOk: boolean;
  retireOk: boolean;
  retireResult: RetireResult;
  eduMonthly: number;
  retireMonthly: number;
}

export default function GoalBanner({
  allEduOk,
  retireOk,
  retireResult,
  eduMonthly,
  retireMonthly,
}: GoalBannerProps) {
  const bothOk = allEduOk && retireOk;
  const totalMonthly = eduMonthly + retireMonthly;

  const bg = bothOk
    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
    : allEduOk || retireOk
      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
      : 'linear-gradient(135deg, #1a2b4a 0%, #2d3f63 100%)';

  return (
    <div style={{
      background: bg,
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 20,
      color: '#fff',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,.15)',
    }}>
      {/* メインメッセージ */}
      <div style={{ flex: '1 1 220px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>
          {bothOk
            ? '🎉 教育・老後ともに達成見込み！'
            : allEduOk
              ? '✅ 教育費は達成　⏳ 老後資金を積み上げ中'
              : retireOk
                ? '⏳ 教育費を要確認　✅ 老後資金は達成見込み'
                : '📊 シミュレーション中'}
        </div>
        <div style={{ fontSize: 13, opacity: .85 }}>
          毎月 教育{eduMonthly}万円 + 老後{retireMonthly}万円 = 合計
          <strong style={{ marginLeft: 4, fontSize: 15 }}>{totalMonthly}万円</strong>
          /月 積立中
        </div>
      </div>

      {/* ステータスチップ */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip
          label="教育費"
          ok={allEduOk}
          sub={allEduOk ? '達成！' : '積立中'}
        />
        <Chip
          label="老後資金"
          ok={retireOk}
          sub={retireOk
            ? `${retireResult.achieveYear ?? retireResult.stepUpAchieveYear}年達成`
            : '積立継続'}
        />
      </div>
    </div>
  );
}

function Chip({ label, ok, sub }: { label: string; ok: boolean; sub: string }) {
  return (
    <div style={{
      background: ok ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)',
      border: `1px solid ${ok ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)'}`,
      borderRadius: 20,
      padding: '5px 14px',
      textAlign: 'center',
      minWidth: 80,
    }}>
      <div style={{ fontSize: 11, opacity: .8 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>
        {ok ? '✅' : '⏳'} {sub}
      </div>
    </div>
  );
}
