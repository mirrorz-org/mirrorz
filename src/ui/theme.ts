import React from "react";

export type Theme = "light" | "dark";
export type ThemePreference = "system" | Theme;

export const ThemeContext = React.createContext<Theme>("light");
