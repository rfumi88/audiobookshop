import { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        localStorage.setItem('theme', theme);

        document.documentElement.setAttribute(
            'data-theme',
            theme
        );
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === 'light'
                ? 'dark'
                : 'light'
        );
    };

    const isDark = theme === 'dark';
    const colors = {
        background: isDark ? '#1e1e1e' : '#ffffff',
        text: isDark ? '#f1f1f1' : '#222222',
        card: isDark ? '#2b2b2b' : '#f7f7f7',
        border: isDark ? '#555555' : '#dddddd',
        input: isDark ? '#333333' : '#ffffff',
        button: isDark ? '#555555' : '#eeeeee',
        buttonText: isDark ? '#ffffff' : '#222222'
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                colors
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
