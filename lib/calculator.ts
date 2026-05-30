import { AppConfig, InputState, ChildConfig, ChildResult, HsType, ChildId } from './types';

export const CHILD_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
export const CHILD_IDS    = ['s', 'k', 'a', 'b'] as const;

const SUBSIDY = {
  public:  { admission: 26, annual: 54 },
  private: { admission: 26, annual: 70 },
};

const HS_COST: Record<HsType, { base: number; juku: number; label: string }> = {
  public:  { base: 30, juku: 25, label: '公立高校' },
  private: { base: 71, juku: 35, label: '私立高校' },
  none:    { base: 0,  juku: 0,  label: '高校なし' },
};

// ============================================================
// 子ども1人の教育資金計算
// ============================================================
export function calcChild(
  ch: ChildConfig & { id: string },
  eduPerChild: number,
  inputs: InputState,
  currentYear: number,
  sibBonus = 0,
  sibBonusYear = 0,
): ChildResult {
  const type = inputs[`${ch.id}Type` as keyof InputState] as 'public' | 'private';
  const univCost = type === 'private' ? inputs.univCostPrivate : inputs.univCostPublic;
  const s = SUBSIDY[type] || SUBSIDY.public;
  const subsidyAmt = (inputs.subsidyOn && ch.subsidyYears > 0)
    ? (s.admission + s.annual * ch.subsidyYears) : 0;

  // 奨学金
  const scholAmt = inputs.scholOn ? (inputs[`${ch.id}Schol` as keyof InputState] as number) * 48 : 0;

  // 高校費用
  const hsTypeVal = inputs[`${ch.id}HsType` as keyof InputState] as HsType;
  const hsJukuOn  = inputs[`${ch.id}HsJuku` as keyof InputState] as boolean;
  const hsCost = (HS_COST[hsTypeVal]?.base || 0) * 3
               + (hsJukuOn ? (HS_COST[hsTypeVal]?.juku || 0) * 3 : 0);

  const netCost = Math.max(0, univCost * 4 + hsCost - subsidyAmt - scholAmt);

  const insGain = (ch.insurance > 0 && ch.insYear > 0 && ch.insYear <= ch.univYear) ? ch.insurance : 0;
  const sbiGain = (ch.sbi > 0 && ch.sbiYear > 0 && ch.sbiYear <= ch.univYear) ? ch.sbi : 0;
  const bonus = insGain + sbiGain;

  const yrs = Math.max(0, ch.univYear - currentYear);
  const effSibBonus = (sibBonus > 0 && sibBonusYear > 0 && sibBonusYear <= ch.univYear + 4) ? sibBonus : 0;

  // 老後資金取り崩し
  const withdrawBoost = (inputs.withdrawOn && inputs.withdrawTarget === ch.id)
    ? (inputs.withdrawAmt || 0) : 0;

  const savings = ch.current + bonus + effSibBonus + eduPerChild * yrs * 12 + withdrawBoost;
  const gap = netCost - savings;
  const pct = netCost <= 0 ? 100 : Math.min(100, Math.round(savings / netCost * 100));
  const minMonthly = yrs > 0 ? Math.max(0, gap / (yrs * 12)) : (gap > 0 ? 999 : 0);
  const surplusForNext = Math.max(0, Math.round(-gap));

  return {
    netCost, savings, gap, pct, insGain, sbiGain, bonus,
    subsidyAmt, scholAmt, minMonthly, yrs, sibBonus: effSibBonus,
    surplusForNext, hsCost, hsTypeVal, withdrawBoost,
  };
}

// ============================================================
// 奨学金返済情報
// ============================================================
export function getRepayInfo(ch: ChildConfig & { id: string; univEndYear: number }, inputs: InputState) {
  const monthly = inputs.scholOn ? (inputs[`${ch.id}Schol` as keyof InputState] as number) : 0;
  if (monthly <= 0) return null;
  const type = inputs.scholType;
  if (type === 'grant') return null;
  const totalLoan = monthly * 48;

  if (type === 'type1') {
    const repayYears = 15;
    const repayMonthly = Math.round(totalLoan / (repayYears * 12) * 10) / 10;
    return { totalLoan, repayMonthly, repayYears, annualRate: 0,
             totalRepay: repayMonthly * repayYears * 12,
             startYear: ch.univEndYear + 1, endYear: ch.univEndYear + repayYears,
             rateLabel: '無利子' };
  }

  if (type === 'type2') {
    const repayYears = 20;
    const annualRate = Math.min(3, Math.max(0, inputs.scholRate));
    const n = repayYears * 12;
    let repayMonthly: number, totalRepay: number;
    if (annualRate <= 0) {
      repayMonthly = Math.round(totalLoan / n * 100) / 100;
      totalRepay   = Math.round(repayMonthly * n * 10) / 10;
    } else {
      const r = annualRate / 100 / 12;
      repayMonthly = Math.round(totalLoan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) * 100) / 100;
      totalRepay   = Math.round(repayMonthly * n * 10) / 10;
    }
    return { totalLoan, repayMonthly, repayYears, annualRate, totalRepay,
             totalInterest: Math.round((totalRepay - totalLoan) * 10) / 10,
             startYear: ch.univEndYear + 1, endYear: ch.univEndYear + repayYears,
             rateLabel: annualRate.toFixed(1) + '%（年利）' };
  }
  return null;
}

// ============================================================
// 老後資金シミュレーション
// ============================================================
export interface RetireResult {
  current: number;
  target: number;
  gap: number;
  pct: number;
  achieveYear: number | null;
  monthlyDisp: number;
  yearData: { year: number; balance: number }[];
  stepUpAchieveYear: number | null;
}

export function calcRetirement(
  config: AppConfig,
  inputs: InputState,
  children: (ChildConfig & { id: string; univEndYear: number })[],
): RetireResult {
  const target    = inputs.retireTarget;
  const rate      = inputs.investReturn / 100;
  const monthly   = inputs.retireMonthly;
  const wAmt      = inputs.withdrawOn ? inputs.withdrawAmt : 0;
  const wYear     = inputs.withdrawOn ? inputs.withdrawYear : null;
  const baseYear  = config.baseYear;

  let balance = config.retireCurrent;
  let achieveYear: number | null = null;
  const yearData: { year: number; balance: number }[] = [];

  // ステップアップスケジュール
  const stepUps: { year: number; addMonthly: number }[] = [];
  if (inputs.stepUpOn) {
    children.forEach(ch => {
      const endYr = ch.univEndYear;
      const perChild = inputs.eduMonthly / children.length;
      stepUps.push({ year: endYr + 1, addMonthly: perChild });
    });
  }

  let extraMonthly = 0;
  let stepUpAchieveYear: number | null = null;
  let balanceWithStep = config.retireCurrent;

  for (let yr = baseYear; yr <= 2070; yr++) {
    // 取り崩し
    if (wYear && yr === wYear) balance = Math.max(0, balance - wAmt);

    // 年次積立（複利）
    balance = balance * (1 + rate) + monthly * 12;
    if (!achieveYear && balance >= target) achieveYear = yr;
    yearData.push({ year: yr, balance: Math.round(balance) });

    // ステップアップ計算（別トラック）
    stepUps.forEach(s => { if (yr === s.year) extraMonthly += s.addMonthly; });
    balanceWithStep = balanceWithStep * (1 + rate) + (monthly + extraMonthly) * 12;
    if (inputs.stepUpOn && !stepUpAchieveYear && balanceWithStep >= target) stepUpAchieveYear = yr;

    if (yr > 2060 && achieveYear) break;
  }

  const pct = Math.min(100, Math.round(config.retireCurrent / target * 100));
  const gap = Math.max(0, target - config.retireCurrent);

  return {
    current: config.retireCurrent,
    target,
    gap,
    pct,
    achieveYear,
    monthlyDisp: monthly,
    yearData,
    stepUpAchieveYear: inputs.stepUpOn ? stepUpAchieveYear : null,
  };
}

// ============================================================
// 老後最低必要月額（2進探索）
// ============================================================
export function calcRetireMinMonthly(config: AppConfig, inputs: InputState): number {
  const target = inputs.retireTarget;
  const rate = inputs.investReturn / 100;
  let lo = 0, hi = 100;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    let pool = config.retireCurrent;
    let found = false;
    for (let yr = config.baseYear; yr <= 2065; yr++) {
      pool = pool * (1 + rate) + mid * 12;
      if (pool >= target) { found = true; break; }
    }
    if (found) hi = mid; else lo = mid;
  }
  return Math.ceil(hi * 10) / 10;
}

// ============================================================
// 教育資金 投資運用計算
// ============================================================
export interface EduInvestResult {
  currentFV: number;
  insFV: number;
  sbiFV: number;
  savingsFV: number;
  totalFV: number;
  totalBase: number;
  investGain: number;
}

export function calcEduInvest(
  ch: ChildConfig & { id: string },
  eduPerChild: number,
  annualRate: number,
  currentYear: number,
): EduInvestResult {
  const r = annualRate / 12;
  const yrs = Math.max(0, ch.univYear - currentYear);
  const n = yrs * 12;

  const savingsFV = r > 0 && n > 0
    ? Math.round(eduPerChild * (Math.pow(1 + r, n) - 1) / r)
    : eduPerChild * n;

  const currentFV = Math.round(ch.current * Math.pow(1 + annualRate, yrs));

  let insFV = 0;
  if (ch.insurance > 0 && ch.insYear > 0 && ch.insYear <= ch.univYear) {
    insFV = Math.round(ch.insurance * Math.pow(1 + annualRate, ch.univYear - ch.insYear));
  }
  let sbiFV = 0;
  if (ch.sbi > 0 && ch.sbiYear > 0 && ch.sbiYear <= ch.univYear) {
    sbiFV = Math.round(ch.sbi * Math.pow(1 + annualRate, ch.univYear - ch.sbiYear));
  }

  const totalFV = Math.round(currentFV + insFV + sbiFV + savingsFV);
  const totalBase = Math.round(
    ch.current +
    (ch.insurance > 0 && ch.insYear <= ch.univYear ? ch.insurance : 0) +
    (ch.sbi > 0 && ch.sbiYear <= ch.univYear ? ch.sbi : 0) +
    eduPerChild * n,
  );
  return { currentFV, insFV, sbiFV, savingsFV, totalFV, totalBase, investGain: Math.max(0, totalFV - totalBase) };
}

// ============================================================
// 子ども専用 教育投資ファンド計算
// ============================================================
export interface EduFundResult {
  targetId: ChildId;
  ch: ChildConfig & { id: string };
  initial: number;
  monthly: number;
  startYear: number;
  annualRate: number;
  holdYears: number;
  initialFV: number;
  monthlyFV: number;
  totalFV: number;
  totalBase: number;
  gain: number;
  gainRate: number;
}

export function calcEduFund(
  inputs: InputState,
  children: (ChildConfig & { id: string })[],
): EduFundResult | null {
  if (!inputs.fundOn) return null;
  const ch = children.find(c => c.id === inputs.fundTarget);
  if (!ch) return null;

  const { fundInitial: initial, fundMonthly: monthly, fundStartYear: startYear, fundRate } = inputs;
  const annualRate = fundRate / 100;
  const holdYears = Math.max(0, ch.univYear - startYear);
  const n = holdYears * 12;
  const r = annualRate / 12;

  const initialFV = Math.round(initial * Math.pow(1 + annualRate, holdYears));
  const monthlyFV = r > 0 && n > 0
    ? Math.round(monthly * (Math.pow(1 + r, n) - 1) / r)
    : Math.round(monthly * n);

  const totalFV = initialFV + monthlyFV;
  const totalBase = Math.round(initial + monthly * n);
  const gain = totalFV - totalBase;
  const gainRate = totalBase > 0 ? Math.round(gain / totalBase * 100) : 0;

  return { targetId: inputs.fundTarget, ch, initial, monthly, startYear, annualRate, holdYears, initialFV, monthlyFV, totalFV, totalBase, gain, gainRate };
}

// ============================================================
// 年毎の推移テーブルデータ
// ============================================================
export interface YearRow {
  year: number;
  balance: number;
  note: string; // 'normal' | 'entry' | 'attend' | 'deficit'
}

export function calcYearlyTable(
  ch: ChildConfig & { id: string; univEndYear: number },
  eduPerChild: number,
  inputs: InputState,
  currentYear: number,
  sibBonus: number,
  sibBonusYear: number,
): YearRow[] {
  const type = inputs[`${ch.id}Type` as keyof InputState] as 'public' | 'private';
  const univCost = type === 'private' ? inputs.univCostPrivate : inputs.univCostPublic;
  const univCostPerYear = univCost; // 4年分を年割り

  const rows: YearRow[] = [];
  let balance = ch.current;

  for (let yr = currentYear; yr <= ch.univEndYear + 1; yr++) {
    // 一時収入
    if (ch.insYear === yr && ch.insurance > 0) balance += ch.insurance;
    if (ch.sbiYear === yr && ch.sbi > 0) balance += ch.sbi;
    // 兄の余剰
    if (sibBonus > 0 && sibBonusYear > 0 && yr === sibBonusYear) balance += sibBonus;
    // 在学中（大学）は学費引き落とし
    if (yr >= ch.univYear && yr < ch.univEndYear) {
      balance += eduPerChild * 12;
      balance -= univCostPerYear;
    } else if (yr < ch.univYear) {
      balance += eduPerChild * 12;
    }

    let note = 'normal';
    if (yr === ch.univYear) note = 'entry';
    else if (yr > ch.univYear && yr < ch.univEndYear) note = 'attend';
    if (balance < 0) note = 'deficit';

    rows.push({ year: yr, balance: Math.round(balance), note });
    if (yr >= ch.univEndYear) break;
  }
  return rows;
}
