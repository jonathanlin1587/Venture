import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VentureLogo } from './VentureLogo';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;

export const LandingHeader: React.FC = () => {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    navigation.navigate('Login' as never);
  };

  const scrollToSection = (sectionId: string) => {
    if (isWeb) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <View style={[styles.header, isWeb && styles.headerSticky]}>
      <View style={styles.headerContent}>
        {/* Logo */}
        <TouchableOpacity
          onPress={() => scrollToSection('hero')}
          activeOpacity={0.8}
        >
          <VentureLogo size={isMobile ? 'medium' : 'large'} variant="full" />
        </TouchableOpacity>

        {/* Navigation Links - Desktop */}
        {isWeb && !isMobile && (
          <View style={styles.navLinks}>
            {navLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                onPress={() => scrollToSection(link.id)}
                activeOpacity={0.7}
                style={styles.navLink}
              >
                <Text style={styles.navLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <TouchableOpacity
            onPress={() => setMenuOpen(!menuOpen)}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{menuOpen ? '✕' : '☰'}</Text>
          </TouchableOpacity>
        )}

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Mobile Menu Dropdown */}
      {isMobile && menuOpen && (
        <View style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <TouchableOpacity
              key={link.id}
              onPress={() => scrollToSection(link.id)}
              style={styles.mobileMenuItem}
              activeOpacity={0.7}
            >
              <Text style={styles.mobileMenuText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
    ...theme.shadows.card,
    zIndex: 1000,
  },
  headerSticky: {
    position: 'sticky' as any,
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isWeb ? 48 : 24,
    paddingVertical: isWeb ? 20 : 16,
    maxWidth: isWeb ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    ...(isWeb && {
      cursor: 'pointer' as any,
    }),
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: theme.colors.text,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: isWeb ? 24 : 20,
    paddingVertical: isWeb ? 12 : 10,
    borderRadius: theme.radii.md,
    ...(isWeb && {
      cursor: 'pointer' as any,
      transition: 'all 0.2s ease' as any,
    }),
  },
  loginButtonText: {
    color: '#fff',
    fontSize: isWeb ? 16 : 14,
    fontWeight: '600',
  },
  mobileMenu: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingVertical: 8,
  },
  mobileMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  mobileMenuText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
});
