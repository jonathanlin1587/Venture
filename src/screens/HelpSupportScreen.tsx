import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { theme } from '../theme';

export const HelpSupportScreen: React.FC = () => {
  const handleEmailSupport = () => {
    const email = 'support@venture.app';
    const subject = 'Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const faqs = [
    {
      question: 'How do I create a bucket?',
      answer: 'Tap the "+ New" button on the Buckets screen, fill in the details, choose an icon and color, then tap "Create".',
    },
    {
      question: 'Can I share buckets with others?',
      answer: 'Yes! When creating or editing a bucket, choose "Duo" or "Group" type, then add members by their email address.',
    },
    {
      question: 'How do I complete a goal?',
      answer: 'Tap the checkbox next to a goal. You can add photos and write a memory journal entry to celebrate your achievement.',
    },
    {
      question: 'Can I edit goals after creating them?',
      answer: 'Yes, tap the edit icon (✏️) on any goal to modify its details, due date, categories, or completion information.',
    },
    {
      question: 'What happens if I delete a bucket?',
      answer: 'Deleting a bucket will permanently remove it and all its goals. This action cannot be undone.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get Help</Text>
        
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleEmailSupport}
          activeOpacity={0.85}
        >
          <Text style={styles.helpButtonIcon}>✉️</Text>
          <View style={styles.helpButtonInfo}>
            <Text style={styles.helpButtonTitle}>Email Support</Text>
            <Text style={styles.helpButtonSubtitle}>support@venture.app</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.helpInfo}>
          <Text style={styles.helpInfoText}>
            We typically respond within 24 hours. For urgent issues, please include "URGENT" in your subject line.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources</Text>
        
        <Text style={styles.resourceText}>
          • Check out our getting started guide in the app
        </Text>
        <Text style={styles.resourceText}>
          • Visit our website for tutorials and tips
        </Text>
        <Text style={styles.resourceText}>
          • Follow us on social media for updates
        </Text>
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
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  sectionTitle: {
    ...theme.typography.title,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 16,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.md,
    marginBottom: 12,
  },
  helpButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  helpButtonInfo: {
    flex: 1,
  },
  helpButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  helpButtonSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  menuArrow: {
    fontSize: 24,
    color: theme.colors.textMuted,
    fontWeight: '300',
  },
  helpInfo: {
    padding: 12,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.md,
  },
  helpInfoText: {
    ...theme.typography.body,
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  resourceText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textMuted,
    marginBottom: 8,
    lineHeight: 22,
  },
});
