import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TondinoProvider } from '../context/TondinoContext';
import { useUI } from '../context/UIContext';
import { useStats } from '../context/StatsContext';

function UIConsumer() {
  const { isDarkMode, toggleTheme } = useUI();
  return (
    <button data-testid="theme-btn" onClick={toggleTheme}>
      {isDarkMode ? 'dark' : 'light'}
    </button>
  );
}

function StatsConsumer() {
  const { userStats } = useStats();
  return <div data-testid="stats">{userStats ? JSON.stringify(userStats) : 'empty'}</div>;
}

describe('Context boundaries', () => {
  it('toggling UI theme re-renders UIConsumer but not StatsConsumer', async () => {
    // ensure localStorage is available to libs that call it at init
    // JSDOM provides localStorage, so we don't need to overwrite it.
    localStorage.clear();

    let uiRenders = 0;
    let statsRenders = 0;

    function UIConsumerLocal() {
      uiRenders++;
      const { isDarkMode, toggleTheme } = useUI();
      return (
        <button data-testid="theme-btn" onClick={toggleTheme}>
          {isDarkMode ? 'dark' : 'light'}
        </button>
      );
    }

    function StatsConsumerLocal() {
      statsRenders++;
      const { userStats } = useStats();
      return <div data-testid="stats">{userStats ? JSON.stringify(userStats) : 'empty'}</div>;
    }

    const { getByTestId } = render(
      <TondinoProvider>
        <UIConsumerLocal />
        <StatsConsumerLocal />
      </TondinoProvider>
    );

    const initialUI = uiRenders;
    const initialStats = statsRenders;

    const btn = getByTestId('theme-btn');
    fireEvent.click(btn);

    // After toggling theme, UI should have re-rendered, stats should not
    const initialText = getByTestId('theme-btn').textContent;
    fireEvent.click(getByTestId('theme-btn'));
    const afterText = getByTestId('theme-btn').textContent;
    expect(afterText).toBe(initialText === 'dark' ? 'light' : 'dark');
    expect(uiRenders).toBeGreaterThan(initialUI);
    expect(statsRenders).toBe(initialStats);
  });
});
