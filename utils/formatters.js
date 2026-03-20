const LUXURY_COLORS = {
  black: {
    bg: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    text: '#f5f5f5',
    border: 'rgba(201, 169, 97, 0.3)'
  },
  blue: {
    bg: 'linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%)',
    text: '#f7fafc',
    border: 'rgba(228, 212, 168, 0.3)'
  },
  brown: {
    bg: 'linear-gradient(135deg, #7c5c4f 0%, #5c4033 100%)',
    text: '#fef5e7',
    border: 'rgba(212, 175, 55, 0.3)'
  },
  gray: {
    bg: 'linear-gradient(135deg, #5a6779 0%, #4a5568 100%)',
    text: '#f7fafc',
    border: 'rgba(201, 169, 97, 0.3)'
  },
  green: {
    bg: 'linear-gradient(135deg, #3d6b22 0%, #2d5016 100%)',
    text: '#f0fff4',
    border: 'rgba(228, 212, 168, 0.3)'
  },
  pink: {
    bg: 'linear-gradient(135deg, #8e3773 0%, #702459 100%)',
    text: '#fff5f7',
    border: 'rgba(255, 215, 0, 0.3)'
  },
  purple: {
    bg: 'linear-gradient(135deg, #5a4a9b 0%, #44337a 100%)',
    text: '#faf5ff',
    border: 'rgba(228, 212, 168, 0.3)'
  },
  red: {
    bg: 'linear-gradient(135deg, #9b3939 0%, #742a2a 100%)',
    text: '#fff5f5',
    border: 'rgba(255, 215, 0, 0.3)'
  },
  white: {
    bg: 'linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)',
    text: '#1a1a1a',
    border: 'rgba(201, 169, 97, 0.4)'
  },
  yellow: {
    bg: 'linear-gradient(135deg, #9d7300 0%, #7c5c00 100%)',
    text: '#fffff0',
    border: 'rgba(247, 247, 247, 0.3)'
  }
};

const DEFAULT_COLOR = {
  bg: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
  text: '#f5f5f5',
  border: 'rgba(201, 169, 97, 0.3)'
};

function getColorScheme(colorName) {
  if (!colorName) return DEFAULT_COLOR;
  const key = colorName.toLowerCase();
  return LUXURY_COLORS[key] || DEFAULT_COLOR;
}

function getCardStyle(colorName) {
  const scheme = getColorScheme(colorName);
  return `background: ${scheme.bg}; color: ${scheme.text}; border-color: ${scheme.border};`;
}

function formatHeight(height) {
  if (!height) return '0.0';
  return (height / 10).toFixed(1);
}

function formatWeight(weight) {
  if (!weight) return '0.0';
  return (weight / 10).toFixed(1);
}

function formatPokemonId(id) {
  if (!id) return '000';
  return String(id).padStart(3, '0');
}

function getCaptureRatePercent(rate) {
  const n = Number(rate);
  if (Number.isNaN(n)) return 0;
  return Math.min((n / 255) * 100, 100);
}

module.exports = {
  getColorScheme,
  getCardStyle,
  formatHeight,
  formatWeight,
  formatPokemonId,
  getCaptureRatePercent
};
