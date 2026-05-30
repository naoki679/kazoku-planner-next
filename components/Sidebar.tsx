'use client';

import { AppConfig, InputState, ChildConfig } from '@/lib/types';

interface SidebarProps {
  inputs: InputState;
  config: AppConfig;
  children_: (ChildConfig & { id: string; color: string; univEndYear: number })[];
  onInputChange: (key: keyof InputState, val: InputState[keyof InputState]) => void;
  isOpen: boolean;
}

// ============================================================
// 共通UIパーツ
// ============================================================
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
      color: 'var(--muted)', textTransform: 'uppercase',
      borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--text)', flexShrink: 0 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{children}</span>
    </div>
  );
}

function NumInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  suffix = '万円',
  width = 72,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  width?: number;
}) {
  return (
    <>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width, padding: '3px 6px', fontSize: 13,
          border: '1px solid var(--border)', borderRadius: 4,
          textAlign: 'right', color: 'var(--text)',
        }}
      />
      <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{suffix}</span>
    </>
  );
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 6 }}>
      <div
        onClick={onToggle}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative',
          background: on ? 'var(--green)' : 'var(--border)',
          transition: 'background .2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </div>
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  );
}

function SbSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { v: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontSize: 12, padding: '3px 4px', border: '1px solid var(--border)',
        borderRadius: 4, color: 'var(--text)', background: 'var(--card)',
      }}
    >
      {options.map(o => (
        <option key={o.v} value={o.v}>{o.label}</option>
      ))}
    </select>
  );
}

// ============================================================
// Sidebar 本体
// ============================================================
export default function Sidebar({ inputs, config, children_, onInputChange, isOpen }: SidebarProps) {
  const ic = (key: keyof InputState, val: string) =>
    onInputChange(key, val as InputState[keyof InputState]);

  return (
    <aside style={{
      width: 280,
      minWidth: 280,
      background: 'var(--card)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto',
      padding: '16px 14px 32px',
      zIndex: 300,
      position: isOpen ? 'fixed' : 'relative',
      top: isOpen ? 58 : undefined,
      left: 0,
      height: isOpen ? 'calc(100vh - 58px)' : 'auto',
      transition: 'transform .25s',
    }}>

      {/* ── 積立金額 ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>毎月の積立</SectionTitle>
        <Row label="教育費 合計">
          <NumInput
            value={inputs.eduMonthly}
            onChange={v => onInputChange('eduMonthly', v)}
            min={0} max={50} step={0.5} suffix="万円/月"
          />
        </Row>
        <Row label="老後資金">
          <NumInput
            value={inputs.retireMonthly}
            onChange={v => onInputChange('retireMonthly', v)}
            min={0} max={50} step={0.5} suffix="万円/月"
          />
        </Row>
      </div>

      {/* ── 子どもの進路 ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>子どもの進路</SectionTitle>
        {children_.map(child => (
          <div key={child.id} style={{
            marginBottom: 10, padding: '8px 10px',
            borderLeft: `3px solid ${child.color}`,
            background: 'var(--bg)', borderRadius: '0 6px 6px 0',
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{child.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', fontSize: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                高校:
                <SbSelect
                  value={inputs[`${child.id}HsType` as keyof InputState] as string}
                  options={[
                    { v: 'public', label: '公立' },
                    { v: 'private', label: '私立' },
                    { v: 'none', label: 'なし' },
                  ]}
                  onChange={v => ic(`${child.id}HsType` as keyof InputState, v)}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inputs[`${child.id}HsJuku` as keyof InputState] as boolean}
                  onChange={e => onInputChange(`${child.id}HsJuku` as keyof InputState, e.target.checked)}
                />
                塾あり
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                大学:
                <SbSelect
                  value={inputs[`${child.id}Type` as keyof InputState] as string}
                  options={[
                    { v: 'public', label: '国公立' },
                    { v: 'private', label: '私立' },
                  ]}
                  onChange={v => ic(`${child.id}Type` as keyof InputState, v)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* ── 大学費用設定 ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>大学費用（4年間合計）</SectionTitle>
        <Row label="国公立">
          <NumInput value={inputs.univCostPublic} onChange={v => onInputChange('univCostPublic', v)} min={50} max={300} />
        </Row>
        <Row label="私立">
          <NumInput value={inputs.univCostPrivate} onChange={v => onInputChange('univCostPrivate', v)} min={50} max={500} />
        </Row>
        <Toggle
          on={inputs.subsidyOn}
          onToggle={() => onInputChange('subsidyOn', !inputs.subsidyOn)}
          label="多子大学無償化を適用"
        />
      </div>

      {/* ── 奨学金 ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>奨学金</SectionTitle>
        <Toggle
          on={inputs.scholOn}
          onToggle={() => onInputChange('scholOn', !inputs.scholOn)}
          label="奨学金を利用する"
        />
        {inputs.scholOn && (
          <div>
            <Row label="種別">
              <SbSelect
                value={inputs.scholType}
                options={[
                  { v: 'grant', label: '給付（返済不要）' },
                  { v: 'type1', label: '第一種（無利子）' },
                  { v: 'type2', label: '第二種（有利子）' },
                ]}
                onChange={v => ic('scholType', v)}
              />
            </Row>
            {inputs.scholType === 'type2' && (
              <Row label="金利">
                <NumInput value={inputs.scholRate} onChange={v => onInputChange('scholRate', v)} min={0} max={3} step={0.1} suffix="%" width={56} />
              </Row>
            )}
            {children_.map(child => (
              <Row key={child.id} label={`${child.name} 月額`}>
                <NumInput
                  value={inputs[`${child.id}Schol` as keyof InputState] as number}
                  onChange={v => onInputChange(`${child.id}Schol` as keyof InputState, v)}
                  min={0} max={12} step={0.1} suffix="万円/月" width={60}
                />
              </Row>
            ))}
          </div>
        )}
      </div>

      {/* ── 老後資金 ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>老後資金</SectionTitle>
        <Row label="目標額">
          <NumInput value={inputs.retireTarget} onChange={v => onInputChange('retireTarget', v)} min={500} max={5000} step={100} />
        </Row>
        <Row label="運用利率">
          <NumInput value={inputs.investReturn} onChange={v => onInputChange('investReturn', v)} min={0} max={10} step={0.5} suffix="%" width={56} />
        </Row>
        <Toggle
          on={inputs.stepUpOn}
          onToggle={() => onInputChange('stepUpOn', !inputs.stepUpOn)}
          label="子ども卒業後に積立アップ"
        />
      </div>

      {/* ── 老後資金の一時取り崩し ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>老後資金の一時取り崩し</SectionTitle>
        <Toggle
          on={inputs.withdrawOn}
          onToggle={() => onInputChange('withdrawOn', !inputs.withdrawOn)}
          label="取り崩しを利用"
        />
        {inputs.withdrawOn && (
          <div>
            <Row label="対象の子">
              <SbSelect
                value={inputs.withdrawTarget}
                options={children_.map(c => ({ v: c.id, label: c.name }))}
                onChange={v => ic('withdrawTarget', v)}
              />
            </Row>
            <Row label="実施年">
              <NumInput value={inputs.withdrawYear} onChange={v => onInputChange('withdrawYear', v)} min={config.baseYear} max={2060} step={1} suffix="年" width={68} />
            </Row>
            <Row label="取り崩し額">
              <NumInput value={inputs.withdrawAmt} onChange={v => onInputChange('withdrawAmt', v)} min={0} max={1000} step={10} />
            </Row>
          </div>
        )}
      </div>

      {/* ── 教育資金 投資運用 ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>📈 教育資金 投資運用</SectionTitle>
        <Toggle
          on={inputs.eduInvestOn}
          onToggle={() => onInputChange('eduInvestOn', !inputs.eduInvestOn)}
          label="投資運用を使う"
        />
        {inputs.eduInvestOn && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>運用利回り（年率）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                type="range" min={0} max={8} step={0.5}
                value={inputs.eduInvestReturn}
                onChange={e => onInputChange('eduInvestReturn', Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--blue)' }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', minWidth: 36 }}>
                {inputs.eduInvestReturn.toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', background: '#f0fdf4', padding: '4px 8px', borderRadius: 6, marginBottom: 8, lineHeight: 1.5 }}>
              📊 オルカン長期平均 5〜7%／バランス型 3〜5%<br />
              <span style={{ color: 'var(--red)' }}>※元本保証なし</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>運用に回す子どもを選択</div>
            {children_.map(child => (
              <div key={child.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: child.color, fontWeight: 700 }}>{child.name}</span>
                <Toggle
                  on={inputs[`${child.id}Invest` as keyof InputState] as boolean}
                  onToggle={() => onInputChange(`${child.id}Invest` as keyof InputState, !inputs[`${child.id}Invest` as keyof InputState])}
                  label=""
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 子ども専用 教育投資ファンド ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>💰 子ども専用 教育投資ファンド</SectionTitle>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
          特定の子の教育費を投資信託で中長期運用するシミュレーション
        </div>
        <Toggle
          on={inputs.fundOn}
          onToggle={() => onInputChange('fundOn', !inputs.fundOn)}
          label="専用ファンドを使う"
        />
        {inputs.fundOn && (
          <div style={{ marginTop: 8 }}>
            <Row label="対象の子">
              <SbSelect
                value={inputs.fundTarget}
                options={children_.map(c => ({ v: c.id, label: c.name }))}
                onChange={v => ic('fundTarget', v)}
              />
            </Row>
            <Row label="運用開始年">
              <NumInput value={inputs.fundStartYear} onChange={v => onInputChange('fundStartYear', v)} min={config.baseYear} max={2060} step={1} suffix="年" width={68} />
            </Row>
            <Row label="初期投資額">
              <NumInput value={inputs.fundInitial} onChange={v => onInputChange('fundInitial', v)} min={0} max={2000} step={10} />
            </Row>
            <Row label="月額積立">
              <NumInput value={inputs.fundMonthly} onChange={v => onInputChange('fundMonthly', v)} min={0} max={50} step={1} suffix="万/月" width={56} />
            </Row>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>運用利回り（年率）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="range" min={0} max={8} step={0.5}
                value={inputs.fundRate}
                onChange={e => onInputChange('fundRate', Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--blue)' }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', minWidth: 36 }}>
                {inputs.fundRate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
