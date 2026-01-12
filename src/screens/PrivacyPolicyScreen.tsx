import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';

export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last updated: January 2024</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.sectionText}>
          We collect information that you provide directly to us, including:
        </Text>
        <Text style={styles.bulletPoint}>• Account information (name, email address)</Text>
        <Text style={styles.bulletPoint}>• Content you create (buckets, goals, photos, journal entries)</Text>
        <Text style={styles.bulletPoint}>• Usage data and app interactions</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.sectionText}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
        <Text style={styles.bulletPoint}>• Process your transactions and send related information</Text>
        <Text style={styles.bulletPoint}>• Send you technical notices and support messages</Text>
        <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.sectionText}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only:
        </Text>
        <Text style={styles.bulletPoint}>• With other users you explicitly share buckets with</Text>
        <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
        <Text style={styles.bulletPoint}>• With service providers who assist us in operating our app</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.sectionText}>
          We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.sectionText}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access your personal information</Text>
        <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
        <Text style={styles.bulletPoint}>• Delete your account and data</Text>
        <Text style={styles.bulletPoint}>• Export your data</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Contact Us</Text>
        <Text style={styles.sectionText}>
          If you have questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>Email: privacy@venture.app</Text>
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
