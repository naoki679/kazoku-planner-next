'use client';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenConfig: () => void;
  onReset: () => void;
  saveBadge: boolean;
  baseYear: number;
  numChildren: number;
}

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  onReset,
  saveBadge,
  baseYear,
  numChildren,
}: HeaderProps) {
  return (
    <header style={{
      background: 'var(--navy)',
      color: '#fff',
      padding: '0 16px',
      height: 58,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 300,
      boxShadow: '0 2px 8px rgba(0,0,0,.3)',
    }}>
      {/* ダッシュボードへ戻る */}
      <a
        href="/index.html"
        title="ダッシュボードへ戻る"
        style={{
          background: 'rgba(255,255,255,.12)',
          border: '1px solid rgba(255,255,255,.2)',
          color: '#fff',
          borderRadius: 6,
          padding: '5px 10px',
          fontSize: 12,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        戻る
      </a>

      {/* ハンバーガーボタン */}
      <button
        onClick={onToggleSidebar}
        aria-label="メニューを開閉"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: 6,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          transition: 'background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{
          display: 'block', width: 22, height: 2, background: '#fff',
          transform: sidebarOpen ? 'translateY(7px) rotate(45deg)' : 'none',
          transition: 'transform .25s',
        }} />
        <span style={{
          display: 'block', width: 22, height: 2, background: '#fff',
          opacity: sidebarOpen ? 0 : 1,
          transition: 'opacity .25s',
        }} />
        <span style={{
          display: 'block', width: 22, height: 2, background: '#fff',
          transform: sidebarOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
          transition: 'transform .25s',
        }} />
      </button>

      {/* タイトル */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '.5px', lineHeight: 1.2 }}>
          教育・老後資金プランナー
        </div>
        <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>
          {baseYear}年基準 · 子ども{numChildren}人
        </div>
      </div>

      {/* 保存バッジ */}
      {saveBadge && (
        <div style={{
          fontSize: 11,
          background: 'rgba(255,255,255,.15)',
          borderRadius: 20,
          padding: '3px 10px',
          color: '#a5f3fc',
          whiteSpace: 'nowrap',
        }}>
          保存済み
        </div>
      )}

      {/* リセットボタン */}
      <button
        onClick={onReset}
        title="すべての設定を初期値に戻す"
        style={{
          background: 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.2)',
          color: '#fff',
          borderRadius: 6,
          padding: '5px 10px',
          cursor: 'pointer',
          fontSize: 12,
          whiteSpace: 'nowrap',
        }}
      >
        リセット
      </button>
    </header>
  );
}
