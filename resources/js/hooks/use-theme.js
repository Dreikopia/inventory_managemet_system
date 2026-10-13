import * as React from 'react';

const STORAGE_KEY = 'aircare-theme';

const getStoredTheme = () => {
    try {
        const theme = localStorage.getItem(STORAGE_KEY);

        return theme === 'light' || theme === 'dark' ? theme : null;
    } catch (error) {
        return null;
    }
};

const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (theme) => {
    const resolvedTheme = theme ?? getSystemTheme();

    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.style.colorScheme = resolvedTheme;
};

export function useTheme() {
    const [theme, setThemeState] = React.useState(() => getStoredTheme() ?? 'system');

    React.useEffect(() => {
        applyTheme(theme === 'system' ? null : theme);
    }, [theme]);

    React.useEffect(() => {
        if (theme !== 'system') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => applyTheme(null);

        mediaQuery.addEventListener('change', onChange);

        return () => mediaQuery.removeEventListener('change', onChange);
    }, [theme]);

    const setTheme = React.useCallback((nextTheme) => {
        setThemeState(nextTheme);

        try {
            if (nextTheme === 'system') {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, nextTheme);
            }
        } catch (error) {
            // Storage unavailable (private mode); the theme still applies for this visit.
        }
    }, []);

    const toggleTheme = React.useCallback(() => {
        const isDark = document.documentElement.classList.contains('dark');

        setTheme(isDark ? 'light' : 'dark');
    }, [setTheme]);

    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

    return { theme, resolvedTheme, setTheme, toggleTheme };
}
