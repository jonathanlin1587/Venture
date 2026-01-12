import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface VentureLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'full' | 'icon' | 'text';
  style?: ViewStyle;
  color?: string;
}

export const VentureLogo: React.FC<VentureLogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  style,
  color = '#6366F1'
}) => {
  const sizeMap = {
    small: { container: 32, icon: 20, text: 16, stroke: 3 },
    medium: { container: 48, icon: 32, text: 24, stroke: 4 },
    large: { container: 64, icon: 44, text: 32, stroke: 5 },
  };

  const dimensions = sizeMap[size];

  // Create a stylized "V" icon - modern, premium design
  const renderIcon = () => {
    const iconSize = dimensions.icon;
    const strokeWidth = dimensions.stroke;
    const padding = iconSize * 0.15;
    const innerSize = iconSize - padding * 2;
    const vWidth = innerSize * 0.7;
    const vHeight = innerSize * 0.65;
    
    return (
      <View style={[styles.iconContainer, { 
        width: iconSize, 
        height: iconSize,
        borderRadius: iconSize * 0.22,
        backgroundColor: `${color}12`, // 12% opacity background
        borderWidth: 2.5,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }]}>
        <View style={[styles.vShape, { 
          width: vWidth, 
          height: vHeight,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }]}>
          {/* Left leg of V */}
          <View style={[styles.vLeg, {
            width: strokeWidth,
            height: vHeight * 0.75,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            left: vWidth * 0.2,
            bottom: 0,
            transform: [{ rotate: '22deg' }],
          }]} />
          {/* Right leg of V */}
          <View style={[styles.vLeg, {
            width: strokeWidth,
            height: vHeight * 0.75,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            right: vWidth * 0.2,
            bottom: 0,
            transform: [{ rotate: '-22deg' }],
          }]} />
        </View>
      </View>
    );
  };

  if (variant === 'icon') {
    return (
      <View style={[style]}>
        {renderIcon()}
      </View>
    );
  }

  if (variant === 'text') {
    return (
      <View style={[styles.textContainer, style]}>
        <Text style={[styles.text, { fontSize: dimensions.text, color }]}>Venture</Text>
      </View>
    );
  }

  // Full logo with icon and text
  return (
    <View style={[styles.fullContainer, style]}>
      {renderIcon()}
      <Text style={[styles.fullText, { fontSize: dimensions.text }]}>Venture</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  vShape: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  vLeg: {
    position: 'absolute',
    top: 0,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  fullText: {
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 1,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

