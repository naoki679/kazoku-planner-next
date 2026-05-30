'use client';

import { useState } from 'react';
import { AppConfig, ChildConfig } from '@/lib/types';

interface ConfigModalProps {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
  onClose: () => void;
}

/** birthYear + birthMonth から大学入学年を計算（日本の学年制度） */
function calcUnivYear(birthYear: number, birthMonth: number): number {
  if (!birthYear || birthYear < 1990) return 0;
  // 4月以降生まれ → +19、1〜3月生まれ → +18
  return birthMonth >= 4 ? birthYear + 19 : birthYear + 18;
}

export default function ConfigModal({ config, onSave, onClose }: ConfigModalProps) {
  const [draft, setDraft] = useState<AppConfig>(JSON.parse(JSON.stringify(config)));

  function updateChild(i: number, key: keyof ChildConfig, val: string | number) {
    setDraft(prev => {
      const children = prev.children.map((c, ci) => {
        if (ci !== i) return c;
        const updated = { ...c, [key]: val };
        // birthYear か birthMonth が変わったら univYear を自動計算
        if (key === 'birthYear' || key === 'birthMonth') {
          const by = key === 'birthYear' ? Number(val) : updated.birthYear;
          const bm = key === 'birthMonth' ? Number(val) : updated.birthMonth;
          if (by > 1990) {
            updated.univYear = calcUnivYear(by, bm);
          }
        }
        return updated;
      });
      return { ...prev, children };
    });
  }

  const childColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
  const currentYear = new Date().getFullYear();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,.55)',
      backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 640,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}>
        {/* ヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy), var(--navy2))',
          padding: '16px 20px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>⚙️ 前提条件の設定</div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff',
            width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14,
          }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>

          {/* ── 基本設定 ── */}
          <Section title="📅 基本設定">
            <Row label="基準年度">
              <input type="number" value={draft.baseYear} min={2020} max={2030}
                onChange={e => setDraft(p => ({ ...p, baseYear: Number(e.target.value) }))}
                style={inputStyle} />
              <span style={unitStyle}>年</span>
            </Row>
            <Row label="老後資金 現在残高">
              <input type="number" value={draft.retireCurrent} min={0} max={5000} step={10}
                onChange={e => setDraft(p => ({ ...p, retireCurrent: Number(e.target.value) }))}
                style={inputStyle} />
              <span style={unitStyle}>万円</span>
            </Row>
            <Row label="子どもの人数">
              <select value={draft.numChildren}
                onChange={e => setDraft(p => ({ ...p, numChildren: Number(e.target.value) }))}
                style={{ ...inputStyle, width: 80 }}>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}人</option>)}
              </select>
            </Row>
          </Section>

          {/* ── あなた ── */}
          <Section title="👤 あなた">
            <Row label="名前">
              <input type="text" value={draft.myName || ''}
                placeholder="あなた"
                onChange={e => setDraft(p => ({ ...p, myName: e.target.value }))}
                style={{ ...inputStyle, width: 120, textAlign: 'left' }} />
            </Row>
            <Row label="生まれ年">
              <input type="number" value={draft.myBirthYear || ''}
                placeholder="例: 1984"
                min={1950} max={2005}
                onChange={e => setDraft(p => ({ ...p, myBirthYear: Number(e.target.value) }))}
                style={inputStyle} />
              {draft.myBirthYear > 1950 && (
                <span style={{ ...unitStyle, color: 'var(--blue)' }}>
                  （現在{currentYear - draft.myBirthYear}歳）
                </span>
              )}
            </Row>
          </Section>

          {/* ── 配偶者 ── */}
          <Section title="👤 配偶者">
            <Row label="名前">
              <input type="text" value={draft.spouseName || ''}
                placeholder="（任意）"
                onChange={e => setDraft(p => ({ ...p, spouseName: e.target.value }))}
                style={{ ...inputStyle, width: 120, textAlign: 'left' }} />
            </Row>
            <Row label="生まれ年">
              <input type="number" value={draft.spouseBirthYear || ''}
                placeholder="例: 1987"
                min={1950} max={2005}
                onChange={e => setDraft(p => ({ ...p, spouseBirthYear: Number(e.target.value) }))}
                style={inputStyle} />
              {(draft.spouseBirthYear || 0) > 1950 && (
                <span style={{ ...unitStyle, color: 'var(--purple)' }}>
                  （現在{currentYear - draft.spouseBirthYear}歳）
                </span>
              )}
            </Row>
          </Section>

          {/* ── 子ども別設定 ── */}
          {draft.children.slice(0, draft.numChildren).map((child, i) => (
            <Section key={i} title={
              <span style={{ color: childColors[i] }}>
                👶 子ども {i + 1}（{child.name || `子供${i + 1}`}）
              </span>
            }>
              <Row label="名前（漢字）">
                <input type="text" value={child.name}
                  onChange={e => updateChild(i, 'name', e.target.value)}
                  style={{ ...inputStyle, width: 110, textAlign: 'left' }} />
              </Row>
              <Row label="よみがな">
                <input type="text" value={child.yomi}
                  onChange={e => updateChild(i, 'yomi', e.target.value)}
                  style={{ ...inputStyle, width: 130, textAlign: 'left' }} />
              </Row>

              {/* 生まれ年・月 → univYear 自動計算 */}
              <div style={{
                background: '#f0f9ff',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 10,
                border: '1px solid #bae6fd',
              }}>
                <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 700, marginBottom: 8 }}>
                  🍼 生年月日（入力すると大学入学年を自動計算）
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <input type="number"
                    value={child.birthYear || ''}
                    placeholder="例: 2009"
                    min={1995} max={2025}
                    onChange={e => updateChild(i, 'birthYear', Number(e.target.value))}
                    style={{ ...inputStyle, width: 88 }} />
                  <span style={unitStyle}>年</span>
                  <select
                    value={child.birthMonth || 6}
                    onChange={e => updateChild(i, 'birthMonth', Number(e.target.value))}
                    style={{ ...inputStyle, width: 64 }}>
                    {Array.from({ length: 12 }, (_, k) => k + 1).map(m => (
                      <option key={m} value={m}>{m}月</option>
                    ))}
                  </select>
                  {child.birthYear > 1990 && (
                    <span style={{ fontSize: 11, color: '#0369a1' }}>
                      → {child.univYear}年4月入学予定
                    </span>
                  )}
                </div>
                {child.birthYear > 1990 && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    現在 {currentYear - child.birthYear}歳
                  </div>
                )}
              </div>

              <Row label="大学入学年（手動上書き可）">
                <input type="number" value={child.univYear} min={2024} max={2060}
                  onChange={e => updateChild(i, 'univYear', Number(e.target.value))}
                  style={inputStyle} />
                <span style={unitStyle}>年 4月</span>
              </Row>
              <Row label="4/1生まれの方は3月として入力" label2>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}> </span>
              </Row>

              <Row label="現在の教育貯金">
                <input type="number" value={child.current} min={0} max={2000} step={10}
                  onChange={e => updateChild(i, 'current', Number(e.target.value))}
                  style={inputStyle} />
                <span style={unitStyle}>万円</span>
              </Row>
              <Row label="学資保険 満期額">
                <input type="number" value={child.insurance} min={0} max={1000} step={10}
                  onChange={e => updateChild(i, 'insurance', Number(e.target.value))}
                  style={inputStyle} />
                <span style={unitStyle}>万円</span>
              </Row>
              {child.insurance > 0 && (
                <Row label="  満期年">
                  <input type="number" value={child.insYear} min={2024} max={2060}
                    onChange={e => updateChild(i, 'insYear', Number(e.target.value))}
                    style={inputStyle} />
                  <span style={unitStyle}>年</span>
                </Row>
              )}
              <Row label="SBI等 一時収入">
                <input type="number" value={child.sbi} min={0} max={1000} step={10}
                  onChange={e => updateChild(i, 'sbi', Number(e.target.value))}
                  style={inputStyle} />
                <span style={unitStyle}>万円</span>
              </Row>
              {child.sbi > 0 && (
                <Row label="  受取年">
                  <input type="number" value={child.sbiYear} min={2024} max={2060}
                    onChange={e => updateChild(i, 'sbiYear', Number(e.target.value))}
                    style={inputStyle} />
                  <span style={unitStyle}>年</span>
                </Row>
              )}
              <Row label="多子補助 対象年数">
                <select value={child.subsidyYears}
                  onChange={e => updateChild(i, 'subsidyYears', Number(e.target.value))}
                  style={{ ...inputStyle, width: 100 }}>
                  {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}年</option>)}
                </select>
              </Row>
            </Section>
          ))}
        </div>

        {/* フッター */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          position: 'sticky', bottom: 0,
          background: 'var(--card)',
        }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg)', cursor: 'pointer', fontSize: 13,
          }}>キャンセル</button>
          <button onClick={() => { onSave(draft); onClose(); }} style={{
            padding: '8px 24px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#fff', cursor: 'pointer',
            fontWeight: 700, fontSize: 13,
          }}>💾 保存して反映</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: 'var(--muted)',
        borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, label2, children }: { label: string; label2?: boolean; children: React.ReactNode }) {
  if (label2) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--text)', minWidth: 160 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{children}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: 80, padding: '4px 8px', fontSize: 13,
  border: '1px solid var(--border)', borderRadius: 6,
  textAlign: 'right', color: 'var(--text)', background: 'var(--bg)',
};
const unitStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap',
};
