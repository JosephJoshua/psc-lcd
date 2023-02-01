const theme = {
  colors: {
    primary: '#C9002E',
    white: '#FFFAFF',
    black: '#050401',
    cyan: '#30BCED',
    green: '#15803D',
    slate: '#64748B',
    lightgray: '#EEE',
    gray: '#6B7280',
    red: '#DC2626',
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontSize: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 24,
    xl: 32,
  },
  spacing: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 32,
    xl: 64,
    xxl: 128,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  breakpoints: {
    phone: '(min-width: 0)',
    tablet: '(min-width: 768px)',
  },
} as const;

export default theme;
