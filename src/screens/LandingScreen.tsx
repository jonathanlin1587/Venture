import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LandingHeader } from '../components/LandingHeader';
import { VentureLogo } from '../components/VentureLogo';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleGetStarted = () => {
    navigation.navigate('Login' as never);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Adventure Enthusiast',
      content: 'Venture has completely transformed how I plan and track my adventures. The bucket system makes it so easy to organize everything!',
      avatar: '👩',
    },
    {
      name: 'Marcus Johnson',
      role: 'Travel Blogger',
      content: 'The collaboration features are amazing. My partner and I can plan our trips together and share memories in real-time.',
      avatar: '👨',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Life Coach',
      content: 'I recommend Venture to all my clients. It helps them turn their dreams into actionable goals and celebrate their achievements.',
      avatar: '👩‍💼',
    },
  ];

  const faqs = [
    {
      question: 'Is Venture free to use?',
      answer: 'Yes! Venture is completely free to use. We believe everyone should have access to tools that help them achieve their dreams and capture their adventures.',
    },
    {
      question: 'Can I share my buckets with others?',
      answer: 'Absolutely! Venture supports solo, duo, and group buckets. You can invite friends and family to collaborate on shared adventures and goals.',
    },
    {
      question: 'How do I track my progress?',
      answer: 'Each goal within your buckets can be marked as complete, and you can add photos and journal entries to celebrate your achievements. The app provides visual progress tracking for all your goals.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take your privacy seriously. All data is encrypted and stored securely. You can read our Privacy Policy for more details.',
    },
    {
      question: 'Can I use Venture on multiple devices?',
      answer: 'Yes! Your data syncs across all your devices, so you can access your buckets and goals from your phone, tablet, or computer.',
    },
  ];

  return (
    <View style={styles.container}>
      <LandingHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection} id="hero">
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Capture, share, and complete life's adventures
            </Text>
            <Text style={styles.heroSubtitle}>
              Turn your dreams into goals, your goals into plans, and your plans into memories.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGetStarted}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  if (isWeb) {
                    const element = document.getElementById('features');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section} id="features">
          <Text style={styles.sectionTitle}>Everything you need to achieve your dreams</Text>
          <Text style={styles.sectionSubtitle}>
            Powerful features designed to help you organize, plan, and celebrate your adventures
          </Text>
          <View style={styles.featuresGrid}>
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
        </View>

        {/* Testimonials Section */}
        <View style={[styles.section, styles.testimonialsSection]} id="testimonials">
          <Text style={styles.sectionTitle}>Loved by adventurers everywhere</Text>
          <Text style={styles.sectionSubtitle}>
            See what our community has to say about their Venture experience
          </Text>
          <View style={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <Text style={styles.testimonialAvatar}>{testimonial.avatar}</Text>
                <Text style={styles.testimonialContent}>"{testimonial.content}"</Text>
                <Text style={styles.testimonialName}>{testimonial.name}</Text>
                <Text style={styles.testimonialRole}>{testimonial.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section} id="pricing">
          <Text style={styles.sectionTitle}>Simple, transparent pricing</Text>
          <Text style={styles.sectionSubtitle}>
            Start your adventure today—no credit card required
          </Text>
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Free Forever</Text>
              <View style={styles.pricingPrice}>
                <Text style={styles.pricingAmount}>$0</Text>
                <Text style={styles.pricingPeriod}>/month</Text>
              </View>
            </View>
            <View style={styles.pricingFeatures}>
              <View style={styles.pricingFeature}>
                <Text style={styles.pricingFeatureIcon}>✓</Text>
                <Text style={styles.pricingFeatureText}>Unlimited buckets</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Text style={styles.pricingFeatureIcon}>✓</Text>
                <Text style={styles.pricingFeatureText}>Unlimited goals</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Text style={styles.pricingFeatureIcon}>✓</Text>
                <Text style={styles.pricingFeatureText}>Photo storage</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Text style={styles.pricingFeatureIcon}>✓</Text>
                <Text style={styles.pricingFeatureText}>Collaboration features</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Text style={styles.pricingFeatureIcon}>✓</Text>
                <Text style={styles.pricingFeatureText}>Cross-device sync</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.pricingButton}
              onPress={handleGetStarted}
              activeOpacity={0.85}
            >
              <Text style={styles.pricingButtonText}>Get Started Free</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, styles.faqSection]} id="faq">
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Everything you need to know about Venture
          </Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.faqIcon}>
                    {expandedFaq === index ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <VentureLogo size="medium" variant="full" />
              <Text style={styles.footerTagline}>
                Turn your dreams into adventures
              </Text>
            </View>
            <View style={styles.footerLinks}>
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Product</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isWeb) {
                      const element = document.getElementById('features');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <Text style={styles.footerLink}>Features</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (isWeb) {
                      const element = document.getElementById('pricing');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <Text style={styles.footerLink}>Pricing</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Company</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PrivacyPolicy' as never)}
                >
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TermsOfService' as never)}
                >
                  <Text style={styles.footerLink}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Support</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HelpSupport' as never)}
                >
                  <Text style={styles.footerLink}>Help & Support</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (isWeb) {
                      const element = document.getElementById('faq');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <Text style={styles.footerLink}>FAQ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} Venture. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: isWeb ? 48 : 24,
    paddingVertical: isWeb ? 80 : 48,
    maxWidth: isWeb ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isWeb ? 48 : 24,
    paddingVertical: isWeb ? 120 : 60,
    minHeight: isWeb ? 600 : 500,
    backgroundColor: theme.colors.background,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: isWeb ? 800 : '100%',
  },
  heroTitle: {
    ...theme.typography.title,
    fontSize: isWeb ? 56 : 32,
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 24,
    lineHeight: isWeb ? 68 : 40,
    fontWeight: '800',
  },
  heroSubtitle: {
    ...theme.typography.subtitle,
    fontSize: isWeb ? 20 : 17,
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginBottom: 40,
    lineHeight: isWeb ? 30 : 26,
    paddingHorizontal: isWeb ? 0 : 20,
  },
  heroButtons: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
    width: isMobile ? '100%' : 'auto',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: isWeb ? 48 : 40,
    paddingVertical: isWeb ? 18 : 16,
    borderRadius: theme.radii.xl,
    minWidth: isMobile ? '100%' : 200,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.floating,
    ...(isWeb && {
      cursor: 'pointer' as any,
    }),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: isWeb ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: isWeb ? 48 : 40,
    paddingVertical: isWeb ? 18 : 16,
    borderRadius: theme.radii.xl,
    minWidth: isMobile ? '100%' : 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...(isWeb && {
      cursor: 'pointer' as any,
    }),
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: isWeb ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    ...theme.typography.title,
    fontSize: isWeb ? 42 : 28,
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    ...theme.typography.subtitle,
    fontSize: isWeb ? 18 : 16,
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginBottom: isWeb ? 64 : 40,
    lineHeight: isWeb ? 28 : 24,
  },
  featuresGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isWeb ? 24 : 16,
    justifyContent: 'center',
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: isWeb ? 32 : 24,
    flex: isMobile ? 1 : isTablet ? 1 : 0,
    minWidth: isMobile ? '100%' : isTablet ? '45%' : 280,
    maxWidth: isMobile ? '100%' : isTablet ? '45%' : 300,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    ...theme.shadows.card,
    ...(isWeb && {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any,
    }),
  },
  featureIcon: {
    fontSize: isWeb ? 48 : 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  featureDescription: {
    ...theme.typography.body,
    fontSize: isWeb ? 16 : 15,
    color: theme.colors.textMuted,
    lineHeight: isWeb ? 24 : 22,
  },
  testimonialsSection: {
    backgroundColor: theme.colors.surface,
  },
  testimonialsGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isWeb ? 32 : 24,
    justifyContent: 'center',
  },
  testimonialCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    padding: isWeb ? 32 : 24,
    flex: isMobile ? 1 : isTablet ? 1 : 0,
    minWidth: isMobile ? '100%' : isTablet ? '45%' : 300,
    maxWidth: isMobile ? '100%' : isTablet ? '45%' : 350,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    ...theme.shadows.card,
  },
  testimonialAvatar: {
    fontSize: 48,
    marginBottom: 16,
  },
  testimonialContent: {
    ...theme.typography.body,
    fontSize: isWeb ? 16 : 15,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: isWeb ? 24 : 22,
    fontStyle: 'italic',
  },
  testimonialName: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: isWeb ? 14 : 13,
    color: theme.colors.textMuted,
  },
  pricingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: isWeb ? 48 : 32,
    maxWidth: isWeb ? 500 : '100%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.floating,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: isWeb ? 32 : 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  pricingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  pricingAmount: {
    fontSize: isWeb ? 56 : 48,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  pricingPeriod: {
    fontSize: isWeb ? 20 : 18,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  pricingFeatures: {
    marginBottom: 32,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingFeatureIcon: {
    fontSize: 20,
    color: theme.colors.success,
    marginRight: 12,
    fontWeight: '700',
  },
  pricingFeatureText: {
    fontSize: isWeb ? 16 : 15,
    color: theme.colors.text,
  },
  pricingButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: isWeb ? 18 : 16,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb && {
      cursor: 'pointer' as any,
    }),
  },
  pricingButtonText: {
    color: '#fff',
    fontSize: isWeb ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  faqSection: {
    backgroundColor: theme.colors.surface,
  },
  faqList: {
    maxWidth: isWeb ? 800 : '100%',
    alignSelf: 'center',
  },
  faqItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isWeb ? 24 : 20,
    ...(isWeb && {
      cursor: 'pointer' as any,
    }),
  },
  faqQuestionText: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 16,
  },
  faqIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  faqAnswer: {
    paddingHorizontal: isWeb ? 24 : 20,
    paddingBottom: isWeb ? 24 : 20,
  },
  faqAnswerText: {
    ...theme.typography.body,
    fontSize: isWeb ? 16 : 15,
    color: theme.colors.textMuted,
    lineHeight: isWeb ? 24 : 22,
  },
  footer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingTop: isWeb ? 64 : 48,
    paddingBottom: isWeb ? 32 : 24,
  },
  footerContent: {
    paddingHorizontal: isWeb ? 48 : 24,
    maxWidth: isWeb ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  footerSection: {
    marginBottom: isWeb ? 48 : 32,
    alignItems: isMobile ? 'center' : 'flex-start',
  },
  footerTagline: {
    ...theme.typography.subtitle,
    fontSize: isWeb ? 16 : 14,
    color: theme.colors.textMuted,
    marginTop: 12,
  },
  footerLinks: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: isMobile ? 'flex-start' : 'space-between',
    marginBottom: isWeb ? 48 : 32,
    gap: isMobile ? 32 : 0,
  },
  footerColumn: {
    marginBottom: isMobile ? 0 : 0,
  },
  footerColumnTitle: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  footerLink: {
    fontSize: isWeb ? 15 : 14,
    color: theme.colors.textMuted,
    marginBottom: 12,
    ...(isWeb && {
      cursor: 'pointer' as any,
    }),
  },
  footerBottom: {
    paddingHorizontal: isWeb ? 48 : 24,
    paddingTop: isWeb ? 32 : 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    alignItems: 'center',
  },
  footerCopyright: {
    ...theme.typography.caption,
    fontSize: isWeb ? 14 : 12,
    color: theme.colors.textMuted,
  },
});
