'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppConfig, InputState, ChildResult, DEFAULT_CONFIG, DEFAULT_INPUT } from '@/lib/types';
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/storage';
import { CHILD_IDS, CHILD_COLORS, calcChild, calcRetirement, calcEduFund, calcRetireMinMonthly } from '@/lib/calculator';
import Header from './Header';
import Sidebar from './Sidebar';
import GoalBanner from './GoalBanner';
import EducationSection from './EducationSection';
import RetirementCard from './RetirementCard';
import NeedBox from './NeedBox';
import YearlyTables from './YearlyTables';
import ConfigModal from './ConfigModal';
import AffiliateBanner from './AffiliateBanner';

export default function PlannerApp() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [inputs, setInputs] = useState<InputState>(DEFAULT_INPUT);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveBadge, setSaveBadge] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('lifePlanSim_onboarded_v1');
    const welcomed  = localStorage.getItem('lifePlanSim_welcomed_v1');
    if (!onboarded && !welcomed) {
      window.location.href = '/index.html';
      return;
    }

    const saved = loadFromStorage();
    if (saved) {
      setConfig(saved.config);
      setInputs(saved.inputs);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveToStorage(config, inputs);
    setSaveBadge(true);
    const t = setTimeout(() => setSaveBadge(false), 2000);
    return () => clearTimeout(t);
  }, [config, inputs, ready]);

  const handleReset = useCallback(() => {
    if (!confirm('すべての設定を初期値に戻しますか？')) return;
    clearStorage();
    setConfig(DEFAULT_CONFIG);
    setInputs(DEFAULT_INPUT);
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>読み込み中...</div>
      </div>
    );
  }

  const children = config.children.slice(0, config.numChildren).map((c, i) => ({
    ...c,
    id: CHILD_IDS[i],
    color: CHILD_COLORS[i],
    univEndYear: c.univYear + 4,
  }));

  const currentYear = config.baseYear;

  const fund = calcEduFund(inputs, children);
  const fundMonthlyUsed = inputs.fundOn ? (fund?.monthly ?? 0) : 0;
  const eduPerChild = Math.max(0, (inputs.eduMonthly - fundMonthlyUsed) / config.numChildren);

  const childResults: ChildResult[] = [];
  for (let i = 0; i < children.length; i++) {
    const prevSurplus: number = i > 0 ? childResults[i - 1].surplusForNext : 0;
    const prevEndYear: number = i > 0 ? children[i - 1].univEndYear : 0;
    childResults.push(calcChild(children[i], eduPerChild, inputs, currentYear, prevSurplus, prevEndYear));
  }

  const retireResult = calcRetirement(config, inputs, children);
  const allEduOk = childResults.every((r: ChildResult) => r.pct >= 100);
  const retireOk = retireResult.achieveYear !== null && retireResult.achieveYear <= 2060;

  const minEduMonthly = childResults.reduce((acc, r) => acc + r.minMonthly, 0);
  const minRetireMonthly = calcRetireMinMonthly(config, inputs);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        onOpenConfig={() => setConfigModalOpen(true)}
        onReset={handleReset}
        saveBadge={saveBadge}
        baseYear={config.baseYear}
        numChildren={config.numChildren}
      />
      <div style={{ display: 'flex', height: 'calc(100vh - 58px)', overflow: 'hidden' }}>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
              zIndex: 290, backdropFilter: 'blur(1px)',
            }}
          />
        )}
        <Sidebar
          inputs={inputs}
          config={config}
          children_={children}
          onInputChange={(key, val) => setInputs(prev => ({ ...prev, [key]: val }))}
          isOpen={sidebarOpen}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
          <GoalBanner
            allEduOk={allEduOk}
            retireOk={retireOk}
            retireResult={retireResult}
            eduMonthly={inputs.eduMonthly}
            retireMonthly={inputs.retireMonthly}
          />
          <NeedBox
            minEduMonthly={minEduMonthly}
            minRetireMonthly={minRetireMonthly}
            currentEdu={inputs.eduMonthly}
            currentRetire={inputs.retireMonthly}
          />
          <EducationSection
            children_={children}
            childResults={childResults}
            inputs={inputs}
          />
          <YearlyTables
            config={config}
            children_={children}
            childResults={childResults}
            inputs={inputs}
            currentYear={currentYear}
            retireResult={retireResult}
            eduPerChild={eduPerChild}
          />
          <RetirementCard
            result={retireResult}
            config={config}
            inputs={inputs}
          />
          <AffiliateBanner />
        </main>
      </div>
      {configModalOpen && (
        <ConfigModal
          config={config}
          onSave={(newConfig) => setConfig(newConfig)}
          onClose={() => setConfigModalOpen(false)}
        />
      )}
    </div>
  );
}
