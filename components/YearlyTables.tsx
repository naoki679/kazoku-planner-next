'use client';

import { ChildConfig, InputState, AppConfig, ChildResult } from '@/lib/types';
import { RetireResult, getRepayInfo } from '@/lib/calculator';

interface Props {
  config: AppConfig;
  children_: (ChildConfig & { id: string; color: string; univEndYear: number })[];
  childResults: ChildResult[];
  inputs: InputState;
  currentYear: number;
  retireResult: RetireResult;
  eduPerChild: number;
}

// ────────────────────────────────────────────────────────────
// ヘルパー
// ────────────────────────────────────────────────────────────

/** 生まれ年が未設定の場合 univYear から推定 */
function effBirthYear(ch: ChildConfig): number {
  return (ch.birthYear && ch.birthYear > 1990) ? ch.birthYear : ch.univYear - 18;
}

/** その年の年齢（カレンダー年ベース） */
function calcAge(birthYear: number, year: number): number {
  return year - birthYear;
}

/** 学年ラベル（小/中/高/大） */
function gradeLabel(ch: ChildConfig & { univEndYear: number }, year: number): string {
  const u = ch.univYear;
  if (year >= u && year < ch.univEndYear) return `大${year - u + 1}年`;
  if (year >= u - 3 && year < u)          return `高${year - (u - 3) + 1}年`;
  if (year >= u - 6 && year < u - 3)     return `中${year - (u - 6) + 1}年`;
  if (year >= u - 12 && year < u - 6)    return `小${year - (u - 12) + 1}年`;
  return '';
}

type Tag = { text: string; color: string; bg: string };

/** 子ども1人分のイベントタグ一覧 */
function childEventTags(
  ch: ChildConfig & { id: string; univEndYear: number },
  year: number,
  inputs: InputState,
): Tag[] {
  const tags: Tag[] = [];
  const u = ch.univYear;

  // 学校入学イベント
  if (year === u - 12) tags.push({ text: '🏫 小学入学', color: '#374151', bg: '#f3f4f6' });
  if (year === u - 6)  tags.push({ text: '📚 中学入学', color: '#1d4ed8', bg: '#dbeafe' });
  if (year === u - 3) {
    const hs = inputs[`${ch.id}HsType` as keyof InputState] as string;
    tags.push({
      text: hs === 'private' ? '🏫 高校入学（私立）' : '🏫 高校入学（公立）',
      color: '#7c3aed', bg: '#ede9fe',
    });
  }
  if (year === u) {
    const ut = inputs[`${ch.id}Type` as keyof InputState] as string;
    tags.push({
      text: ut === 'private' ? '🎓 大学入学（私立）' : '🎓 大学入学（国公立）',
      color: '#dc2626', bg: '#fee2e2',
    });
  }
  if (year === ch.univEndYear) {
    tags.push({ text: '🎓 大学卒業', color: '#059669', bg: '#d1fae5' });
  }

  // 一時金
  if (ch.insurance > 0 && ch.insYear === year) {
    tags.push({ text: `📋 保険満期 +${ch.insurance}万`, color: '#b45309', bg: '#fef3c7' });
  }
  if (ch.sbi > 0 && ch.sbiYear === year) {
    tags.push({ text: `💰 SBI +${ch.sbi}万`, color: '#0369a1', bg: '#e0f2fe' });
  }

  // 多子補助
  if (inputs.subsidyOn && ch.subsidyYears > 0 && year >= u && year < u + ch.subsidyYears) {
    tags.push({ text: '✅ 無償化補助', color: '#166534', bg: '#dcfce7' });
  }

  // 奨学金返済
  if (inputs.scholOn && inputs.scholType !== 'grant') {
    const repay = getRepayInfo(ch as ChildConfig & { id: string; univEndYear: number }, inputs);
    if (repay) {
      if (year === repay.startYear) {
        tags.push({ text: `📝 奨学金返済開始（月${repay.repayMonthly}万）`, color: '#9333ea', bg: '#f3e8ff' });
      } else if (year === repay.endYear) {
        tags.push({ text: '✅ 奨学金完済', color: '#059669', bg: '#dcfce7' });
      }
    }
  }

  return tags;
}

/** 老後資金の残高を万円でフォーマット */
function fmtBal(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '億';
  return n.toLocaleString('ja-JP') + '万';
}

// ────────────────────────────────────────────────────────────
// スタイル定数
// ────────────────────────────────────────────────────────────
const NAME_W = 108;
const COL_W  = 96;

const stickyNameBase: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 3,
  minWidth: NAME_W,
  width: NAME_W,
  padding: '8px 10px',
  borderRight: '2px solid var(--border)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const cellBase: React.CSSProperties = {
  minWidth: COL_W,
  width: COL_W,
  padding: '6px 6px',
  borderRight: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'top',
};

// ────────────────────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────────────────────
export default function YearlyTables({
  config, children_, childResults, inputs, currentYear, retireResult,
}: Props) {
  const myBY = config.myBirthYear || (currentYear - 40);
  const spBY = config.spouseBirthYear || 0;
  const hasSpouse = !!config.spouseName && spBY > 1950;

  // 表示する年の範囲
  const lastEnd = children_.length > 0
    ? Math.max(...children_.map(c => c.univEndYear))
    : currentYear + 10;
  const retireEnd = retireResult.achieveYear || (currentYear + 25);
  const endYear = Math.min(
    Math.max(lastEnd + 3, retireEnd + 1, currentYear + 15),
    currentYear + 35,
  );
  const years = Array.from({ length: endYear - currentYear + 1 }, (_, i) => currentYear + i);

  const HEADER_BG  = 'var(--navy)';
  const TODAY_BG   = '#2563eb';
  const STRIPE_ODD = '#fafbfc';

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
          📅 ライフイベント年表
        </h2>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>← 横スクロールで先を確認</span>
      </div>

      <div style={{
        background: 'var(--card)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            borderCollapse: 'collapse',
            fontSize: 12,
            tableLayout: 'fixed',
            width: NAME_W + years.length * COL_W,
          }}>

            {/* ─── ヘッダー行：年度 ─── */}
            <thead>
              <tr>
                <th style={{
                  ...stickyNameBase,
                  background: HEADER_BG,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  zIndex: 5,
                  borderBottom: '2px solid rgba(255,255,255,.15)',
                }}>
                  家族 / 年度
                </th>
                {years.map(yr => {
                  const isToday = yr === currentYear;
                  return (
                    <th key={yr} style={{
                      ...cellBase,
                      background: isToday ? TODAY_BG : HEADER_BG,
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: isToday ? 800 : 600,
                      borderBottom: '2px solid rgba(255,255,255,.15)',
                      fontSize: isToday ? 13 : 12,
                    }}>
                      {yr}
                      {isToday && <div style={{ fontSize: 9, opacity: .85, marginTop: 1 }}>●今年</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>

              {/* ─── あなた ─── */}
              <tr>
                <td style={{
                  ...stickyNameBase,
                  background: STRIPE_ODD,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 12 }}>
                    👤 {config.myName || 'あなた'}
                  </div>
                </td>
                {years.map(yr => (
                  <td key={yr} style={{
                    ...cellBase,
                    background: yr === currentYear ? '#eff6ff' : STRIPE_ODD,
                    textAlign: 'center',
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 13 }}>
                      {calcAge(myBY, yr)}歳
                    </span>
                  </td>
                ))}
              </tr>

              {/* ─── 配偶者 ─── */}
              {hasSpouse && (
                <tr>
                  <td style={{
                    ...stickyNameBase,
                    background: '#fff',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: 12 }}>
                      👤 {config.spouseName}
                    </div>
                  </td>
                  {years.map(yr => (
                    <td key={yr} style={{
                      ...cellBase,
                      background: yr === currentYear ? '#f5f3ff' : '#fff',
                      textAlign: 'center',
                    }}>
                      <span style={{ fontWeight: 600, color: '#7c3aed', fontSize: 13 }}>
                        {calcAge(spBY, yr)}歳
                      </span>
                    </td>
                  ))}
                </tr>
              )}

              {/* ─── 子どもたち ─── */}
              {children_.map((ch, i) => {
                const by = effBirthYear(ch);
                return (
                  <tr key={ch.id}>
                    <td style={{
                      ...stickyNameBase,
                      background: i % 2 === 0 ? STRIPE_ODD : '#fff',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{ fontWeight: 700, color: ch.color, fontSize: 12, marginBottom: 1 }}>
                        🧒 {ch.name}
                      </div>
                      {ch.yomi && (
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>（{ch.yomi}）</div>
                      )}
                    </td>
                    {years.map(yr => {
                      const a = calcAge(by, yr);
                      const grade = gradeLabel(ch, yr);
                      const tags = childEventTags(ch, yr, inputs);
                      const isUniv = yr >= ch.univYear && yr < ch.univEndYear;
                      const rowBg = yr === currentYear
                        ? `${ch.color}18`
                        : i % 2 === 0 ? STRIPE_ODD : '#fff';

                      return (
                        <td key={yr} style={{ ...cellBase, background: rowBg }}>
                          {/* 年齢 + 学年 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: tags.length ? 3 : 0 }}>
                            <span style={{ fontWeight: 700, color: ch.color }}>
                              {a}歳
                            </span>
                            {grade && (
                              <span style={{
                                fontSize: 10,
                                background: isUniv ? ch.color : '#e2e8f0',
                                color: isUniv ? '#fff' : 'var(--muted)',
                                borderRadius: 3,
                                padding: '0 4px',
                                fontWeight: 600,
                              }}>
                                {grade}
                              </span>
                            )}
                          </div>
                          {/* イベントタグ */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {tags.map((tag, ti) => (
                              <span key={ti} style={{
                                display: 'block',
                                background: tag.bg,
                                color: tag.color,
                                borderRadius: 3,
                                padding: '1px 5px',
                                fontSize: 10,
                                fontWeight: 600,
                                lineHeight: 1.5,
                                whiteSpace: 'nowrap',
                              }}>
                                {tag.text}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ─── 老後資金 ─── */}
              <tr>
                <td style={{
                  ...stickyNameBase,
                  background: '#fffbeb',
                  borderBottom: '1px solid var(--border)',
                  borderTop: '2px solid #fcd34d',
                }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 12 }}>
                    🏦 老後資金
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                    目標 {retireResult.target.toLocaleString()}万
                  </div>
                </td>
                {years.map(yr => {
                  const yrData = retireResult.yearData.find(d => d.year === yr);
                  const bal = yrData?.balance ?? 0;
                  const pct = Math.min(100, Math.round(bal / retireResult.target * 100));
                  const achieved = bal >= retireResult.target;
                  const isAchieveYear = retireResult.achieveYear === yr;
                  const isStepUpYear = retireResult.stepUpAchieveYear === yr
                    && yr !== retireResult.achieveYear;

                  return (
                    <td key={yr} style={{
                      ...cellBase,
                      background: yr === currentYear
                        ? '#fef9c3'
                        : achieved ? '#f0fdf4' : '#fffbeb',
                      borderTop: yr === currentYear ? '2px solid #fcd34d' : undefined,
                    }}>
                      {/* 残高 */}
                      <div style={{
                        fontWeight: 700,
                        color: achieved ? 'var(--green)' : '#92400e',
                        fontSize: 11,
                        marginBottom: 2,
                      }}>
                        {fmtBal(bal)}
                      </div>
                      {/* 達成率バー */}
                      <div style={{
                        height: 4, borderRadius: 2,
                        background: '#e5e7eb',
                        marginBottom: 3,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: achieved ? 'var(--green)' : 'var(--gold)',
                          borderRadius: 2,
                          transition: 'width .3s',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{pct}%</div>
                      {/* 達成バッジ */}
                      {isAchieveYear && (
                        <span style={{
                          display: 'block', marginTop: 3,
                          background: '#d1fae5', color: '#065f46',
                          borderRadius: 3, padding: '1px 5px',
                          fontSize: 10, fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                          🎉 目標達成！
                        </span>
                      )}
                      {isStepUpYear && (
                        <span style={{
                          display: 'block', marginTop: 3,
                          background: '#dbeafe', color: '#1d4ed8',
                          borderRadius: 3, padding: '1px 5px',
                          fontSize: 10, fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                          📈 ステップアップ達成
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>

        {/* 凡例 */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 16px',
          fontSize: 11,
          color: 'var(--muted)',
        }}>
          <span>●今年</span>
          <span>🏫 学校入学</span>
          <span>🎓 大学入学/卒業</span>
          <span>📋 保険満期</span>
          <span>💰 一時金</span>
          <span>✅ 補助/完済</span>
          <span>🎉 老後目標達成</span>
          <span style={{ marginLeft: 'auto' }}>
            ※ 子供情報はトップページ設定から自動連携
          </span>
        </div>
      </div>
    </section>
  );
}
