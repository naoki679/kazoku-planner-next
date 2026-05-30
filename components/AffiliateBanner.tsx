'use client';

/**
 * A8.net アフィリエイトバナーコンポーネント
 *
 * 使い方:
 * 1. A8.netに登録し、提携したい広告主のバナータグを取得する
 * 2. 下記 BANNERS 配列に { id, html } 形式で追加する
 * 3. html には A8.net から発行された img タグ（またはテキストリンク）をそのまま貼る
 *
 * 推奨カテゴリ（学費・老後資金アプリに相性が良い）:
 *  - 学資保険（ソニー生命・フコク生命など）
 *  - iDeCo・NISA（SBI証券・楽天証券など）
 *  - 教育ローン（オリコ・ACOM など）
 *  - FP相談（保険チャンネル・ほけんのぜんぶ など）
 */

interface Banner {
  id: string;
  label: string;
  /** A8.net から取得したアフィリエイトタグ（img or a タグ）*/
  tag: string;
}

// ===== ここにA8.netのタグを貼り付けてください =====
const BANNERS: Banner[] = [
  {
    id: 'placeholder1',
    label: '学資保険',
    // TODO: A8.netで取得したタグに差し替えてください
    tag: `<a href="https://px.a8.net/svt/ejp?a8mat=【YOUR_A8_TAG_1】" rel="nofollow" target="_blank">
      <img src="https://via.placeholder.com/300x100/1a2b4a/ffffff?text=学資保険バナー" border="0" width="300" height="100" alt="学資保険" />
    </a>
    <img border="0" width="1" height="1" src="https://www11.a8.net/0.gif?a8mat=【YOUR_A8_TAG_1】" alt="">`,
  },
  {
    id: 'placeholder2',
    label: 'iDeCo・NISA',
    // TODO: A8.netで取得したタグに差し替えてください
    tag: `<a href="https://px.a8.net/svt/ejp?a8mat=【YOUR_A8_TAG_2】" rel="nofollow" target="_blank">
      <img src="https://via.placeholder.com/300x100/2d3f63/ffffff?text=iDeCo+NISA" border="0" width="300" height="100" alt="iDeCo・NISA" />
    </a>
    <img border="0" width="1" height="1" src="https://www11.a8.net/0.gif?a8mat=【YOUR_A8_TAG_2】" alt="">`,
  },
];
// ===================================================

export default function AffiliateBanner() {
  if (BANNERS.length === 0) return null;

  return (
    <section style={{
      background: 'var(--bg, #f1f5f9)',
      borderTop: '1px solid var(--border, #e2e8f0)',
      padding: '20px 24px',
    }}>
      <p style={{
        fontSize: 11,
        color: 'var(--muted, #64748b)',
        marginBottom: 12,
        textAlign: 'center',
      }}>
        ── PR・広告 ──
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
      }}>
        {BANNERS.map((b) => (
          <div
            key={b.id}
            dangerouslySetInnerHTML={{ __html: b.tag }}
            style={{ lineHeight: 0 }}
          />
        ))}
      </div>
    </section>
  );
}
