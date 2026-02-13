import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from '../constants/Theme';

type ThemeType = typeof Theme;

const ThemeContext = createContext<ThemeType>(Theme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    return (
        <ThemeContext.Provider value={Theme}>
            {children}
        </ThemeContext.Provider>
    );
};
