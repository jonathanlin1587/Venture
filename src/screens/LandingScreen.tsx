import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VentureLogo } from '../components/VentureLogo';
import { theme } from '../theme';

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <VentureLogo size="large" variant="full" />
          </View>
          <Text style={styles.heroTitle}>
            Capture, share, and complete life's adventures
          </Text>
          <Text style={styles.heroSubtitle}>
            Turn your dreams into goals, your goals into plans, and your plans into memories.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📦</Text>
            <Text style={styles.featureTitle}>Create Buckets</Text>
            <Text style={styles.featureDescription}>
              Organize your life adventures into meaningful buckets—solo journeys, shared experiences, or group quests.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureTitle}>Set Goals</Text>
            <Text style={styles.featureDescription}>
              Break down your buckets into actionable goals with due dates, categories, and progress tracking.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureTitle}>Capture Memories</Text>
            <Text style={styles.featureDescription}>
              Celebrate your achievements with photos and journal entries that preserve the moments that matter.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Share & Collaborate</Text>
            <Text style={styles.featureDescription}>
              Work together on duo or group buckets, sharing the journey with friends and loved ones.
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>
            Start your adventure today
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  heroTitle: {
    ...theme.typography.title,
    fontSize: 32,
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 40,
  },
  heroSubtitle: {
    ...theme.typography.subtitle,
    fontSize: 17,
    textAlign: 'center',
    color: theme.colors.textMuted,
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    ...theme.shadows.card,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  featureDescription: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  ctaSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: theme.radii.xl,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.floating,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ctaSubtext: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 16,
  },
});
