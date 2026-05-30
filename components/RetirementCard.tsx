'use client';

import { AppConfig, InputState } from '@/lib/types';
import { RetireResult } from '@/lib/calculator';

interface RetirementCardProps {
  result: RetireResult;
  config: AppConfig;
  inputs: InputState;
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
}

export default function RetirementCard({ result, config, inputs }: RetirementCardProps) {
  const { current, target, gap, pct, achieveYear, stepUpAchieveYear, yearData } = result;
  const isOk = achieveYear !== null && achieveYear <= 2060;

  // グラフ用：2040年まで表示
  const chartData = yearData.filter(d => d.year <= Math.min(achieveYear ?? 2060, 2055) + 2);
  const maxBalance = Math.max(target, ...chartData.map(d => d.balance));

  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
        🏦 老後資金シミュレーション
      </h2>

      <div style={{
        background: 'var(--card)',
        border: `2px solid ${isOk ? 'var(--green)' : 'var(--border)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
      }}>
        {/* ヘッダー */}
        <div style={{
          background: isOk
            ? 'linear-gradient(135deg, #16a34a, #15803d)'
            : 'linear-gradient(135deg, var(--navy), var(--navy2))',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ flex: 1, color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {isOk
                ? `✅ ${achieveYear}年に${fmt(target)}万円達成見込み`
                : '⏳ 目標達成には積立増額が必要です'}
            </div>
            {inputs.stepUpOn && stepUpAchieveYear && stepUpAchieveYear !== achieveYear && (
              <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>
                ステップアップで {stepUpAchieveYear}年達成
              </div>
            )}
          </div>
          <div style={{
            background: 'rgba(255,255,255,.2)',
            borderRadius: 20,
            padding: '4px 14px',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
          }}>
            進捗 {pct}%
          </div>
        </div>

        {/* プログレスバー */}
        <div style={{ height: 6, background: 'var(--border)' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: isOk ? 'var(--green)' : 'var(--blue)',
            transition: 'width .5s',
          }} />
        </div>

        <div style={{ padding: '16px 18px' }}>
          {/* 数値サマリー */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
            marginBottom: 18,
          }}>
            <StatBox label="現在残高" value={`${fmt(current)}万円`} />
            <StatBox label="目標額" value={`${fmt(target)}万円`} />
            <StatBox
              label={gap > 0 ? '不足額' : '余裕額'}
              value={`${fmt(Math.abs(gap))}万円`}
              warn={gap > 0}
              ok={gap <= 0}
            />
            <StatBox label="毎月積立" value={`${inputs.retireMonthly}万円/月`} />
            <StatBox label="想定利率" value={`${inputs.investReturn}%/年`} />
          </div>

          {/* グラフ */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              残高推移グラフ
            </div>
            <div style={{ position: 'relative', height: 120, background: 'var(--bg)', borderRadius: 8, overflow: 'hidden' }}>
              {/* 目標ライン */}
              <div style={{
                position: 'absolute',
                left: 0, right: 0,
                bottom: `${target / maxBalance * 100}%`,
                height: 1,
                background: 'var(--green)',
                opacity: .6,
              }} />

              {/* バーグラフ */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
                padding: '0 4px 0 4px',
              }}>
                {chartData.map((d, i) => {
                  const h = Math.min(100, (d.balance / maxBalance) * 100);
                  const reached = d.balance >= target;
                  return (
                    <div
                      key={d.year}
                      title={`${d.year}年: ${fmt(d.balance)}万円`}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        background: reached ? 'var(--green)' : 'var(--blue)',
                        opacity: reached ? 1 : 0.6,
                        borderRadius: '2px 2px 0 0',
                        minWidth: 2,
                      }}
                    />
                  );
                })}
              </div>

              {/* 年ラベル */}
              <div style={{
                position: 'absolute',
                bottom: 2, left: 4, right: 4,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9,
                color: 'var(--muted)',
                pointerEvents: 'none',
              }}>
                <span>{config.baseYear}</span>
                {achieveYear && <span style={{ color: 'var(--green)', fontWeight: 700 }}>{achieveYear}年達成</span>}
                <span>{chartData[chartData.length - 1]?.year}</span>
              </div>
            </div>
          </div>

          {/* メモ */}
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            ※ 複利計算（年次積立）。実際の運用成果は市場環境により異なります。
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
  warn,
  ok,
}: {
  label: string;
  value: string;
  warn?: boolean;
  ok?: boolean;
}) {
  const color = warn ? 'var(--red)' : ok ? 'var(--green)' : 'var(--text)';
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
