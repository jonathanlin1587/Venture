import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useBucketStore } from '../store/bucketStore';
import { createGoal } from '../services/bucketService';
import { GOAL_CATEGORIES } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRENDING_CARD_WIDTH = SCREEN_WIDTH * 0.85;
const POPULAR_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2 - 8;

// Mock data for discover goals
interface DiscoverGoal {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  addedCount: number;
  category?: string;
}

const TRENDING_GOALS: DiscoverGoal[] = [
  {
    id: '1',
    title: 'Northern Lights in Iceland',
    description: 'Witness the magical aurora borealis dancing across the Arctic sky',
    imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800',
    addedCount: 12450,
    category: 'travel',
  },
  {
    id: '2',
    title: 'Skydiving in Dubai',
    description: 'Experience the ultimate adrenaline rush over the Palm Jumeirah',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    addedCount: 8920,
    category: 'adventure',
  },
  {
    id: '3',
    title: 'Learn to Play Piano',
    description: 'Master your favorite songs and play for friends',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800',
    addedCount: 15680,
    category: 'music',
  },
  {
    id: '4',
    title: 'Run a Marathon',
    description: 'Complete 26.2 miles and cross the finish line',
    imageUrl: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    addedCount: 11230,
    category: 'fitness',
  },
  {
    id: '5',
    title: 'Write a Novel',
    description: 'Tell your story and publish your first book',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    addedCount: 6780,
    category: 'creative',
  },
];

const POPULAR_GOALS: DiscoverGoal[] = [
  {
    id: '6',
    title: 'Visit Machu Picchu',
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400',
    addedCount: 5430,
    category: 'travel',
  },
  {
    id: '7',
    title: 'Learn Spanish',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    addedCount: 9870,
    category: 'education',
  },
  {
    id: '8',
    title: 'Start a Garden',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    addedCount: 4320,
    category: 'hobby',
  },
  {
    id: '9',
    title: 'Meditate Daily',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    addedCount: 15670,
    category: 'mindfulness',
  },
  {
    id: '10',
    title: 'Cook 50 New Recipes',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    addedCount: 7890,
    category: 'food',
  },
  {
    id: '11',
    title: 'Volunteer Monthly',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
    addedCount: 3210,
    category: 'social',
  },
];

const AI_SUGGESTION: DiscoverGoal = {
  id: '12',
  title: 'Build Your Dream Home',
  description: 'Based on your interests in design and architecture, this could be your next big adventure',
  imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  addedCount: 2340,
  category: 'personal',
};

export const DiscoverScreen: React.FC = () => {
  const { user } = useAuth();
  const { buckets, subscribeToBuckets } = useBucketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showBucketSelector, setShowBucketSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<DiscoverGoal | null>(null);

  // Subscribe to buckets when user is available
  useEffect(() => {
    if (user?.id) {
      subscribeToBuckets(user.id);
    }
  }, [user?.id, subscribeToBuckets]);

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('showBucketSelector changed:', showBucketSelector);
    console.log('selectedGoal:', selectedGoal?.title);
    console.log('buckets count:', buckets.length);
  }, [showBucketSelector, selectedGoal, buckets.length]);

  const handleAddToBucket = (goal: DiscoverGoal) => {
    console.log('handleAddToBucket called', { goal: goal.title, user: !!user, bucketsCount: buckets.length });
    if (!user) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Please sign in to add goals');
      } else {
        Alert.alert('Sign In Required', 'Please sign in to add goals');
      }
      return;
    }
    if (buckets.length === 0) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Please create a bucket first to add goals');
      } else {
        Alert.alert('No Buckets', 'Please create a bucket first to add goals');
      }
      return;
    }
    console.log('Setting selected goal and showing bucket selector');
    setSelectedGoal(goal);
    setShowBucketSelector(true);
    console.log('showBucketSelector set to true');
  };

  const handleSelectBucket = async (bucketId: string) => {
    if (!selectedGoal || !user) return;

    try {
      const categoryId = selectedGoal.category;
      await createGoal(
        bucketId,
        selectedGoal.title,
        user.id,
        selectedGoal.description,
        undefined,
        false,
        undefined,
        categoryId ? [categoryId] : undefined
      );
      setShowBucketSelector(false);
      setSelectedGoal(null);
      // Could show a success message here
    } catch (error: any) {
      console.error('Error adding goal to bucket:', error);
      // Could show an error message here
    }
  };


  const formatSocialProof = (count: number) => {
    if (count >= 1000) {
      return `🔥 Added by ${(count / 1000).toFixed(1)}k others`;
    }
    return `🔥 Added by ${count} others`;
  };

  const renderTrendingCard = ({ item }: { item: DiscoverGoal }) => {
    const category = item.category
      ? GOAL_CATEGORIES.find((c) => c.id === item.category)
      : null;

    return (
      <View style={styles.trendingCard}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.trendingCardImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.addButtonTrending}
          onPress={() => {
            console.log('Trending card + button pressed');
            handleAddToBucket(item);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
        <View style={styles.trendingCardOverlay} />
        <View style={styles.trendingCardContent}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color + '40' }]}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}
          <Text style={styles.trendingCardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.trendingCardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.socialProof}>{formatSocialProof(item.addedCount)}</Text>
        </View>
      </View>
    );
  };

  const renderPopularCard = (item: DiscoverGoal) => {
    const category = item.category
      ? GOAL_CATEGORIES.find((c) => c.id === item.category)
      : null;

    return (
      <View style={styles.popularCard}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.popularCardImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            console.log('Popular card + button pressed');
            handleAddToBucket(item);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
        <View style={styles.popularCardOverlay} />
        <View style={styles.popularCardContent}>
          {category && (
            <View style={[styles.categoryBadgeSmall, { backgroundColor: category.color + '40' }]}>
              <Text style={styles.categoryIconSmall}>{category.icon}</Text>
            </View>
          )}
          <Text style={styles.popularCardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.socialProofSmall}>{formatSocialProof(item.addedCount)}</Text>
        </View>
      </View>
    );
  };

  const renderAISuggestion = () => {
    const category = AI_SUGGESTION.category
      ? GOAL_CATEGORIES.find((c) => c.id === AI_SUGGESTION.category)
      : null;

    return (
      <View style={styles.aiCard}>
        <Image
          source={{ uri: AI_SUGGESTION.imageUrl }}
          style={styles.aiCardImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.addButtonAI}
          onPress={() => {
            console.log('AI card + button pressed');
            handleAddToBucket(AI_SUGGESTION);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
        <View style={styles.aiCardOverlay} />
        <View style={styles.aiCardContent}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✨ For You</Text>
          </View>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color + '40' }]}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}
          <Text style={styles.aiCardTitle} numberOfLines={2}>
            {AI_SUGGESTION.title}
          </Text>
          {AI_SUGGESTION.description && (
            <Text style={styles.aiCardDescription} numberOfLines={3}>
              {AI_SUGGESTION.description}
            </Text>
          )}
          <Text style={styles.socialProof}>{formatSocialProof(AI_SUGGESTION.addedCount)}</Text>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {/* Glassmorphism Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search goals..."
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Trending Goals - Horizontal Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Goals</Text>
          <FlatList
            data={TRENDING_GOALS}
            renderItem={renderTrendingCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
            snapToInterval={TRENDING_CARD_WIDTH + 16}
            decelerationRate="fast"
            pagingEnabled={false}
          />
        </View>

        {/* Popular in Your Area - 2 Column Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular in Your Area</Text>
          <View style={styles.popularGrid}>
            {POPULAR_GOALS.map((item) => (
              <View key={item.id} style={styles.popularCardWrapper}>
                {renderPopularCard(item)}
              </View>
            ))}
          </View>
        </View>

        {/* AI Suggestions - Featured Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Suggestions</Text>
          {renderAISuggestion()}
        </View>

      </ScrollView>

      {/* Bottom Sheet Modal for Bucket Selection */}
      <Modal
        visible={showBucketSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowBucketSelector(false);
          setSelectedGoal(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowBucketSelector(false);
            setSelectedGoal(null);
          }}
        >
          <View 
            style={styles.bottomSheet}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Add to Bucket</Text>
            {selectedGoal && (
              <Text style={styles.bottomSheetSubtitle} numberOfLines={2}>
                {selectedGoal.title}
              </Text>
            )}
            <ScrollView style={styles.bucketList} showsVerticalScrollIndicator={false}>
              {buckets.length === 0 ? (
                <View style={styles.emptyBuckets}>
                  <Text style={styles.emptyBucketsText}>
                    Create a bucket first to add goals!
                  </Text>
                </View>
              ) : (
                buckets.map((bucket) => (
                  <TouchableOpacity
                    key={bucket.id}
                    style={styles.bucketItem}
                    onPress={() => handleSelectBucket(bucket.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.bucketItemContent}>
                      <Text style={styles.bucketIcon}>
                        {bucket.theme?.icon || '🎯'}
                      </Text>
                      <View style={styles.bucketItemText}>
                        <Text style={styles.bucketItemName}>{bucket.name}</Text>
                        {bucket.description && (
                          <Text style={styles.bucketItemDescription} numberOfLines={1}>
                            {bucket.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.bucketItemArrow}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowBucketSelector(false);
                setSelectedGoal(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    // Glassmorphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: -0.3,
  },
  trendingList: {
    paddingHorizontal: 20,
    paddingRight: 4,
  },
  trendingCard: {
    width: TRENDING_CARD_WIDTH,
    height: 320,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  trendingCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  trendingCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  trendingCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  trendingCardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  trendingCardDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  popularCardWrapper: {
    width: POPULAR_CARD_WIDTH,
    marginBottom: 16,
  },
  popularCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  popularCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  addButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonTrending: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonAI: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: '#007AFF',
    lineHeight: 24,
  },
  popularCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  popularCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  popularCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aiCard: {
    marginHorizontal: 20,
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    // Special border with glow effect
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  aiCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  aiCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  aiCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  aiBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  aiCardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  aiCardDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryIconSmall: {
    fontSize: 12,
  },
  socialProof: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  socialProofSmall: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  bottomSheetSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bucketList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  emptyBuckets: {
    padding: 40,
    alignItems: 'center',
  },
  emptyBucketsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bucketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 12,
  },
  bucketItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bucketIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bucketItemText: {
    flex: 1,
  },
  bucketItemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bucketItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  bucketItemArrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
});
