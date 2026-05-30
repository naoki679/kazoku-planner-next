// ============================================================
// 型定義
// ============================================================

export type ChildId = 's' | 'k' | 'a' | 'b';
export type UnivType = 'public' | 'private';
export type HsType = 'public' | 'private' | 'none';
export type ScholType = 'grant' | 'type1' | 'type2';

export interface ChildConfig {
  name: string;
  yomi: string;
  birthYear: number;     // 生まれ年（例: 2009）
  birthMonth: number;    // 生まれ月 1-12（大学入学年自動計算に使用）
  current: number;       // 現在の教育貯金（万円）
  insurance: number;     // 学資保険満期額（万円）
  insYear: number;       // 保険満期年
  sbi: number;           // SBI等一時収入（万円）
  sbiYear: number;       // SBI受取年
  univYear: number;      // 大学入学年
  subsidyYears: number;  // 多子補助対象年数
}

export interface AppConfig {
  baseYear: number;
  myName: string;           // あなたの名前
  myBirthYear: number;      // あなたの生まれ年
  spouseName: string;       // 配偶者の名前
  spouseBirthYear: number;  // 配偶者の生まれ年
  retireCurrent: number;    // 老後資金現在残高（万円）
  numChildren: number;
  children: ChildConfig[];
}

export interface InputState {
  // 積立
  eduMonthly: number;
  retireMonthly: number;
  // 大学費用
  univCostPublic: number;
  univCostPrivate: number;
  subsidyOn: boolean;
  // 奨学金
  scholOn: boolean;
  scholType: ScholType;
  scholRate: number;
  sSchol: number;
  kSchol: number;
  aSchol: number;
  bSchol: number;
  // 老後
  retireTarget: number;
  investReturn: number;
  stepUpOn: boolean;
  // 教育投資運用
  eduInvestOn: boolean;
  eduInvestReturn: number;
  sInvest: boolean;
  kInvest: boolean;
  aInvest: boolean;
  bInvest: boolean;
  // 専用ファンド
  fundOn: boolean;
  fundTarget: ChildId;
  fundStartYear: number;
  fundInitial: number;
  fundMonthly: number;
  fundRate: number;
  // 老後取り崩し
  withdrawOn: boolean;
  withdrawTarget: ChildId;
  withdrawYear: number;
  withdrawAmt: number;
  // 大学進路
  sType: UnivType;
  kType: UnivType;
  aType: UnivType;
  bType: UnivType;
  // 高校進路
  sHsType: HsType;
  kHsType: HsType;
  aHsType: HsType;
  bHsType: HsType;
  sHsJuku: boolean;
  kHsJuku: boolean;
  aHsJuku: boolean;
  bHsJuku: boolean;
}

export interface ChildResult {
  netCost: number;
  savings: number;
  gap: number;
  pct: number;
  insGain: number;
  sbiGain: number;
  bonus: number;
  subsidyAmt: number;
  scholAmt: number;
  minMonthly: number;
  yrs: number;
  sibBonus: number;
  surplusForNext: number;
  hsCost: number;
  hsTypeVal: HsType;
  withdrawBoost: number;
}

export const DEFAULT_INPUT: InputState = {
  eduMonthly: 2,
  retireMonthly: 3,
  univCostPublic: 100,
  univCostPrivate: 150,
  subsidyOn: true,
  scholOn: true,
  scholType: 'type2',
  scholRate: 2.0,
  sSchol: 3,
  kSchol: 3,
  aSchol: 3,
  bSchol: 0,
  retireTarget: 2000,
  investReturn: 5,
  stepUpOn: false,
  eduInvestOn: false,
  eduInvestReturn: 5,
  sInvest: false,
  kInvest: false,
  aInvest: false,
  bInvest: false,
  fundOn: false,
  fundTarget: 'b',
  fundStartYear: new Date().getFullYear(),
  fundInitial: 100,
  fundMonthly: 1,
  fundRate: 5,
  withdrawOn: false,
  withdrawTarget: 's',
  withdrawYear: new Date().getFullYear() + 2,
  withdrawAmt: 100,
  sType: 'private',
  kType: 'private',
  aType: 'private',
  bType: 'private',
  sHsType: 'public',
  kHsType: 'public',
  aHsType: 'public',
  bHsType: 'public',
  sHsJuku: true,
  kHsJuku: true,
  aHsJuku: true,
  bHsJuku: true,
};

const _y = new Date().getFullYear();

export const DEFAULT_CONFIG: AppConfig = {
  baseYear: _y,
  myName: 'あなた',
  myBirthYear: _y - 40,
  spouseName: '',
  spouseBirthYear: 0,
  retireCurrent: 0,
  numChildren: 4,
  children: [
    { name: '長男', yomi: 'ちょうなん', birthYear: _y - 17, birthMonth: 6, current: 0, insurance: 0, insYear: 0, sbi: 0, sbiYear: 0, univYear: _y + 4,  subsidyYears: 0 },
    { name: '次男', yomi: 'じなん',     birthYear: _y - 14, birthMonth: 6, current: 0, insurance: 0, insYear: 0, sbi: 0, sbiYear: 0, univYear: _y + 7,  subsidyYears: 0 },
    { name: '三男', yomi: 'さんなん',   birthYear: _y - 12, birthMonth: 6, current: 0, insurance: 0, insYear: 0, sbi: 0, sbiYear: 0, univYear: _y + 9,  subsidyYears: 0 },
    { name: '長女', yomi: 'ちょうじょ', birthYear: _y - 7,  birthMonth: 6, current: 0, insurance: 0, insYear: 0, sbi: 0, sbiYear: 0, univYear: _y + 14, subsidyYears: 0 },
  ],
};
