export const colors = {
  primary: '#6366F1',
  primaryAlt: '#4F46E5',
  accent: '#007AFF',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceSoft: '#F9FAFB',
  text: '#0F172A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  borderSoft: '#E5E7EB',
  danger: '#EF4444',
  success: '#22C55E',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
  },
};

export const theme = {
  colors,
  radii,
  shadows,
  typography,
};

