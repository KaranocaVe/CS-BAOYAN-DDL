type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

function storedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
}

function detect(): Theme {
  return storedTheme() ?? systemTheme();
}

export const theme = $state<{ value: Theme }>({ value: detect() });

function renderTheme(t: Theme) {
  theme.value = t;
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', t === 'dark');
  document.documentElement.style.colorScheme = t;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', t === 'dark' ? '#09090b' : '#fafafa');
}

export function applyTheme(t: Theme) {
  renderTheme(t);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {}
}

export function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

export function initThemeSync() {
  if (typeof window === 'undefined') return () => {};

  const media = window.matchMedia(SYSTEM_THEME_QUERY);
  const syncSystemTheme = (event: MediaQueryListEvent) => {
    if (storedTheme() === null) {
      renderTheme(event.matches ? 'dark' : 'light');
    }
  };

  media.addEventListener('change', syncSystemTheme);
  return () => media.removeEventListener('change', syncSystemTheme);
}
