'use client';

import { ChildConfig, InputState, ChildResult } from '@/lib/types';
import { getRepayInfo } from '@/lib/calculator';

interface EducationSectionProps {
  children_: (ChildConfig & { id: string; color: string; univEndYear: number })[];
  childResults: ChildResult[];
  inputs: InputState;
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
}

const HS_LABEL: Record<string, string> = {
  public: '公立高校',
  private: '私立高校',
  none: '高校なし',
};

export default function EducationSection({ children_, childResults, inputs }: EducationSectionProps) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
        🎓 教育資金シミュレーション
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {children_.map((child, i) => {
          const r = childResults[i];
          const repay = getRepayInfo(child, inputs);
          const univType = inputs[`${child.id}Type` as keyof InputState] as string;
          const hsType = inputs[`${child.id}HsType` as keyof InputState] as string;
          const hsJuku = inputs[`${child.id}HsJuku` as keyof InputState] as boolean;

          return (
            <div key={child.id} style={{
              background: 'var(--card)',
              border: `2px solid ${r.pct >= 100 ? child.color : 'var(--border)'}`,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,.06)',
            }}>
              {/* ヘッダー */}
              <div style={{
                background: child.color,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{child.name}</div>
                  <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 11 }}>
                    大学入学 {child.univYear}年 ({child.univYear - new Date().getFullYear()}年後)
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,.2)',
                  borderRadius: 20,
                  padding: '4px 10px',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                }}>
                  {r.pct}%
                </div>
              </div>

              {/* プログレスバー */}
              <div style={{ height: 6, background: 'var(--border)' }}>
                <div style={{
                  height: '100%',
                  width: `${r.pct}%`,
                  background: r.pct >= 100 ? 'var(--green)' : child.color,
                  transition: 'width .5s',
                }} />
              </div>

              {/* 金額サマリー */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginBottom: 10,
                }}>
                  <StatBox label="必要額" value={`${fmt(r.netCost)}万円`} />
                  <StatBox label="準備済み" value={`${fmt(r.savings)}万円`} accent={child.color} />
                  {r.gap > 0 && (
                    <StatBox label="不足額" value={`${fmt(r.gap)}万円`} warn />
                  )}
                  {r.gap <= 0 && (
                    <StatBox label="余裕額" value={`${fmt(-r.gap)}万円`} ok />
                  )}
                  {r.gap > 0 && (
                    <StatBox label="最低積立" value={`${r.minMonthly.toFixed(1)}万/月`} warn />
                  )}
                </div>

                {/* 進路タグ */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  <Tag color="#64748b">{HS_LABEL[hsType] ?? hsType}{hsJuku ? '＋塾' : ''}</Tag>
                  <Tag color={child.color}>{univType === 'private' ? '私立大学' : '国公立大学'}</Tag>
                  {r.subsidyAmt > 0 && <Tag color="var(--green)">多子補助 {fmt(r.subsidyAmt)}万</Tag>}
                  {r.scholAmt > 0 && <Tag color="var(--purple)">奨学金 {fmt(r.scholAmt)}万</Tag>}
                  {r.bonus > 0 && <Tag color="var(--amber)">保険等 {fmt(r.bonus)}万</Tag>}
                  {r.sibBonus > 0 && <Tag color="var(--teal)">繰越 {fmt(r.sibBonus)}万</Tag>}
                  {r.withdrawBoost > 0 && <Tag color="var(--red)">取崩 {fmt(r.withdrawBoost)}万</Tag>}
                </div>

                {/* 奨学金返済情報 */}
                {repay && (
                  <div style={{
                    background: 'var(--bg)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 11,
                    color: 'var(--muted)',
                  }}>
                    <span style={{ fontWeight: 600 }}>返済:</span>{' '}
                    {repay.startYear}〜{repay.endYear}年 ·
                    月{repay.repayMonthly.toFixed(1)}万円 ·
                    {repay.rateLabel} ·
                    総返済{fmt(repay.totalRepay)}万円
                    {'totalInterest' in repay && repay.totalInterest && repay.totalInterest > 0
                      ? `（うち利息${fmt(repay.totalInterest as number)}万）`
                      : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
  accent,
  warn,
  ok,
}: {
  label: string;
  value: string;
  accent?: string;
  warn?: boolean;
  ok?: boolean;
}) {
  const color = warn ? 'var(--red)' : ok ? 'var(--green)' : accent ?? 'var(--text)';
  return (
    <div style={{
      background: 'var(--bg)',
      borderRadius: 6,
      padding: '6px 10px',
    }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}
