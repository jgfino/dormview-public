import {DefaultTheme} from 'styled-components';

// Colors

const lightColors = {
  black: '#000000',
  darkGray1: '#464646',
  darkGray2: '#585858',
  darkGray3: '#989898',
  lightGray1: '#dddddd',
  lightGray2: '#f4f4f4',
  lightGray3: '#fafafa',
  white: '#ffffff',

  primary: '#8A75D1',
  red: '#e66262',
  green: '#4db164',

  unfocused: '#acacac',
};

const darkColors = {
  black: '#1a1a1a',
  darkGray1: '#3d3d3d',
  darkGray2: '#2e2e2e',
  darkGray3: '#242424',
  lightGray1: '#e6e6e6',
  lightGray2: '#e0e0e0',
  lightGray3: '#c9c9c9',
  white: '#ffffff',

  primary: '#9d8adb',
  red: '#e67777',
  green: '#5adb78',

  unfocused: '#c2c2c2',
};

interface ThemeColors {
  text: {
    primary: string;
    inverted: string;
    secondary1: string;
    secondary2: string;
    white: string;
  };
  background: {
    primary: string;
    secondary1: string;
    secondary2: string;
  };
  accent1: string;
  accent2: string;
  primary: string;
  destructive: string;
  unfocused: string;
  confirm: string;
}

const themeLightColors: ThemeColors = {
  text: {
    primary: lightColors.black,
    inverted: lightColors.white,
    secondary1: lightColors.darkGray1,
    secondary2: lightColors.darkGray2,
    white: '#ffffff',
  },
  background: {
    primary: lightColors.white,
    secondary1: lightColors.lightGray3,
    secondary2: lightColors.lightGray2,
  },
  accent1: lightColors.darkGray3,
  accent2: lightColors.lightGray1,
  primary: lightColors.primary,
  destructive: lightColors.red,
  confirm: lightColors.green,
  unfocused: lightColors.unfocused,
};

const themeDarkColors: ThemeColors = {
  text: {
    primary: darkColors.white,
    inverted: darkColors.black,
    secondary1: darkColors.lightGray1,
    secondary2: darkColors.lightGray2,
    white: '#ffffff',
  },
  background: {
    primary: darkColors.black,
    secondary1: darkColors.darkGray3,
    secondary2: darkColors.darkGray2,
  },
  accent1: darkColors.lightGray3,
  accent2: darkColors.darkGray1,
  primary: darkColors.primary,
  destructive: darkColors.red,
  confirm: darkColors.green,
  unfocused: darkColors.unfocused,
};

// Spacing

interface ThemeSpacing {
  margins: number;
  itemSpacing: number;
}

export const spacing: ThemeSpacing = {
  margins: 16,
  itemSpacing: 8,
};

// Typography

interface ThemeFontWeights {
  bold: string;
  semibold: string;
  medium: string;
  light: string;
}

const fontWeights: ThemeFontWeights = {
  bold: '700',
  semibold: '500',
  medium: '400',
  light: '300',
};

// Theme definition

const baseTheme = {
  fontWeight: fontWeights,
  spacing: spacing,
};

export const lightTheme: DefaultTheme = {
  ...baseTheme,
  colors: themeLightColors,
};

export const darkTheme: DefaultTheme = {
  ...baseTheme,
  colors: themeDarkColors,
};

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: ThemeColors;
    fontWeight: ThemeFontWeights;
    spacing: ThemeSpacing;
  }
}
