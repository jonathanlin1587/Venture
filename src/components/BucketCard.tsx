import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Bucket } from '../types';
import { getUserProfile } from '../services/authService';
import { User } from '../types';

interface BucketCardProps {
  bucket: Bucket;
  onPress: () => void;
  onDelete?: () => void;
  completedGoals?: number;
  totalGoals?: number;
}

const { width } = Dimensions.get('window');
// 20px padding on each side (40px total) + 16px gap between cards = 56px
const CARD_WIDTH = (width - 56) / 2;

export const BucketCard: React.FC<BucketCardProps> = ({ 
  bucket, 
  onPress, 
  onDelete,
  completedGoals = 0,
  totalGoals = 0,
}) => {
  const [memberAvatars, setMemberAvatars] = useState<(User | null)[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const themeColor = bucket.theme?.color || '#007AFF';
  const themeIcon = bucket.theme?.icon || '🎯';
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  useEffect(() => {
    // Load member avatars (limit to first 4 for display)
    const loadMemberAvatars = async () => {
      const membersToLoad = bucket.members.slice(0, 4);
      try {
        const { getUserProfile } = await import('../services/authService');
        const avatars = await Promise.all(
          membersToLoad.map(member => getUserProfile(member.userId))
        );
        setMemberAvatars(avatars);
      } catch (error) {
        console.error('Error loading member avatars:', error);
      }
    };
    loadMemberAvatars();
  }, [bucket.members]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeLabel = () => {
    switch (bucket.type) {
      case 'solo':
        return 'Solo';
      case 'duo':
        return 'Duo';
      case 'group':
        return 'Group';
      default:
        return '';
    }
  };

  // Create gradient background from theme color
  const getGradientColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Create a darker variant for gradient
    const darkR = Math.max(0, r - 30);
    const darkG = Math.max(0, g - 30);
    const darkB = Math.max(0, b - 30);
    return {
      light: `rgb(${r}, ${g}, ${b})`,
      dark: `rgb(${darkR}, ${darkG}, ${darkB})`,
    };
  };

  const gradientColors = getGradientColor(themeColor);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.9}
        onPressIn={() => setShowDelete(true)}
        onPressOut={() => setShowDelete(false)}
        style={styles.card}
      >
        {/* Full-Card Background Image or Gradient */}
        {bucket.coverImage ? (
          <Image 
            source={{ uri: bucket.coverImage }} 
            style={styles.fullCardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.fullCardGradient, { 
            backgroundColor: gradientColors.light,
          }]}>
            <View style={styles.gradientOverlay} />
            <Text style={styles.themeIconLarge}>{themeIcon}</Text>
          </View>
        )}

        {/* Type Badge - Top Left */}
        <View style={styles.typeBadgeContainer}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{getTypeLabel()}</Text>
          </View>
        </View>

        {/* Delete Button - Top Right (Subtle/Ghost) */}
        {onDelete && (
          <TouchableOpacity
            style={[styles.deleteButton, showDelete && styles.deleteButtonVisible]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        )}

        {/* Glassmorphism Overlay at Bottom */}
        <View style={styles.glassContainer}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {bucket.name}
          </Text>

          {/* Member Avatars */}
          {bucket.members.length > 0 && (
            <View style={styles.membersContainer}>
              <View style={styles.avatarsRow}>
                {memberAvatars.slice(0, 3).map((user, index) => (
                  <View 
                    key={user?.id || index} 
                    style={[
                      styles.avatar,
                      index > 0 && styles.avatarOverlap,
                    ]}
                  >
                    {user?.photoURL ? (
                      <Image 
                        source={{ uri: user.photoURL }} 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: themeColor }]}>
                        <Text style={styles.avatarInitials}>
                          {user ? getInitials(user.displayName) : '?'}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
                {bucket.members.length > 3 && (
                  <View style={[styles.avatar, styles.avatarOverlap, styles.avatarMore]}>
                    <Text style={styles.avatarMoreText}>+{bucket.members.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Progress Info */}
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {completedGoals}/{totalGoals} goals
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* Thin Progress Bar at Bottom Edge */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${progress}%`, 
                backgroundColor: themeColor,
              }
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
  },
  fullCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  fullCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  themeIconLarge: {
    fontSize: 64,
    zIndex: 1,
  },
  typeBadgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    // Glassmorphism effect simulation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  typeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    opacity: 0,
  },
  deleteButtonVisible: {
    opacity: 1,
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 22,
  },
  glassContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // Glassmorphism effect - React Native doesn't support backdrop-filter
    // So we use a semi-transparent white background with shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  membersContainer: {
    marginBottom: 12,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarMore: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 0,
  },
});
