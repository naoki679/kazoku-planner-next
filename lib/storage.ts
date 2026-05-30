import { AppConfig, InputState, DEFAULT_CONFIG, DEFAULT_INPUT } from './types';

const STORAGE_KEY = 'lifePlanSim_v2';
// lifeplan.html との連携キー
const PRIVATE_KEY  = 'lifePlanSim_private_v1';
const FAMILY_KEY   = 'lifeplan_family_v1';

export interface SaveData {
  config: AppConfig;
  inputs: InputState;
}

/**
 * kazoku-planner-next のデータを保存し、
 * lifeplan.html が読む 2 つのキーにも同期書き込みする。
 */
export function saveToStorage(config: AppConfig, inputs: InputState): void {
  try {
    // ── 主キー ──────────────────────────────────────────────
    const data: SaveData = { config, inputs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // ── lifeplan.html: lifePlanSim_private_v1 ─────────────
    // getChildren() が univYear > 0 の children を返す形式に合わせる
    const privateChildren = config.children
      .slice(0, config.numChildren)
      .map(c => ({
        name:     c.name,
        yomi:     c.yomi,
        birthYear: c.birthYear || (c.univYear - 18),
        birthMonth: c.birthMonth || 6,
        univYear:  c.univYear,
        current:   c.current,
        insurance: c.insurance,
        insYear:   c.insYear,
        sbi:       c.sbi,
        sbiYear:   c.sbiYear,
        subsidyYears: c.subsidyYears,
      }));

    const ownerAge = config.myBirthYear > 1950
      ? config.baseYear - config.myBirthYear
      : 35;

    const privateData = {
      children: privateChildren,
      inputs: Object.assign({}, inputs, { ownerAge }),
      config,
    };
    localStorage.setItem(PRIVATE_KEY, JSON.stringify(privateData));

    // ── lifeplan.html: lifeplan_family_v1 ─────────────────
    // 設定モーダルの 配偶者・子供表示 に反映される
    let familySettings: Record<string, unknown> = {};
    try {
      familySettings = JSON.parse(localStorage.getItem(FAMILY_KEY) || '{}');
    } catch (_) { /* ignore */ }

    familySettings.spouseBirth = config.spouseBirthYear || 0;
    familySettings.spouseName  = config.spouseName || '';
    familySettings.children    = privateChildren.map(c => ({
      name:      c.name,
      birthYear: c.birthYear,
    }));
    localStorage.setItem(FAMILY_KEY, JSON.stringify(familySettings));

  } catch (e) {
    console.warn('保存エラー:', e);
  }
}

export function loadFromStorage(): SaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;

    // 子どもごとに新フィールド（birthYear 等）を DEFAULT で補完
    const savedChildren: AppConfig['children'] = data.config.children || [];
    const mergedChildren = savedChildren.map(function(c, i) {
      const def = DEFAULT_CONFIG.children[i] || DEFAULT_CONFIG.children[0];
      return Object.assign({}, def, c);
    });

    // Object.assign でマージ後、children を上書き
    const mergedConfig = Object.assign(
      {},
      DEFAULT_CONFIG,
      data.config,
    ) as AppConfig;
    mergedConfig.children = mergedChildren;

    const mergedInputs = Object.assign({}, DEFAULT_INPUT, data.inputs) as InputState;

    return { config: mergedConfig, inputs: mergedInputs };
  } catch (e) {
    console.warn('読込エラー:', e);
    return null;
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PRIVATE_KEY);
  localStorage.removeItem(FAMILY_KEY);
}
