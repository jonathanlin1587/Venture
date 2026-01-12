import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';

export const TermsOfServiceScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.lastUpdated}>Last updated: January 2024</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.sectionText}>
          By accessing and using Venture, you accept and agree to be bound by the terms and provision of this agreement.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Use License</Text>
        <Text style={styles.sectionText}>
          Permission is granted to temporarily use Venture for personal, non-commercial purposes. This license does not include:
        </Text>
        <Text style={styles.bulletPoint}>• Commercial use of the app</Text>
        <Text style={styles.bulletPoint}>• Modification or copying of materials</Text>
        <Text style={styles.bulletPoint}>• Use of the app for any unlawful purpose</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.sectionText}>
          You are responsible for maintaining the confidentiality of your account and password. You agree to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide accurate and complete information</Text>
        <Text style={styles.bulletPoint}>• Keep your account credentials secure</Text>
        <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized use</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. User Content</Text>
        <Text style={styles.sectionText}>
          You retain ownership of all content you create in Venture. By using the app, you grant us a license to store, display, and share your content as necessary to provide the service, including sharing with users you explicitly invite to your buckets.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
        <Text style={styles.sectionText}>
          You may not use Venture to:
        </Text>
        <Text style={styles.bulletPoint}>• Violate any laws or regulations</Text>
        <Text style={styles.bulletPoint}>• Infringe on intellectual property rights</Text>
        <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
        <Text style={styles.bulletPoint}>• Upload malicious code or viruses</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Service Availability</Text>
        <Text style={styles.sectionText}>
          We strive to provide reliable service but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.sectionText}>
          Venture is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.sectionText}>
          We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Contact Information</Text>
        <Text style={styles.sectionText}>
          If you have questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>Email: legal@venture.app</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...theme.typography.title,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  sectionText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 6,
  },
  contactInfo: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
});
