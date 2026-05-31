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

// ===== A8.net 広告タグ =====
const BANNERS: Banner[] = [
  {
    id: 'matsuisec',
    label: '松井証券（iDeCo・NISA）',
    tag: `<a href="https://px.a8.net/svt/ejp?a8mat=455HNM+4HCJ9E+3XCC+6IP2P" rel="nofollow">
<img border="0" width="468" height="60" alt="" src="https://www21.a8.net/svt/bgt?aid=250518946271&wid=003&eno=01&mid=s00000018318001095000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=455HNM+4HCJ9E+3XCC+6IP2P" alt="">`,
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
