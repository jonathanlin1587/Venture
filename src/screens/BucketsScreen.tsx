import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BucketCard } from '../components/BucketCard';
import { useAuth } from '../context/AuthContext';
import {
  createBucket,
  subscribeToUserBuckets,
  deleteBucket,
  subscribeToBucketGoals,
  compressAndConvertToBase64,
  updateBucket,
} from '../services/bucketService';
import { Bucket, BucketType, BUCKET_COLORS, BUCKET_ICONS, Goal } from '../types';

export const BucketsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Check if we should show create modal from navigation params
  useEffect(() => {
    const params = (route.params as any);
    if (params?.showCreateModal) {
      setShowCreateModal(true);
      // Clear the param
      navigation.setParams({ showCreateModal: false } as any);
    }
  }, [(route.params as any)?.showCreateModal]);
  const [bucketName, setBucketName] = useState('');
  const [bucketDescription, setBucketDescription] = useState('');
  const [bucketType, setBucketType] = useState<BucketType>('solo');
  const [bucketColor, setBucketColor] = useState(BUCKET_COLORS[0]);
  const [bucketIcon, setBucketIcon] = useState(BUCKET_ICONS[0]);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketGoals, setBucketGoals] = useState<Record<string, Goal[]>>({});
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState<BucketType | 'all'>('all');
  const [filterProgress, setFilterProgress] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('date');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);

  const getBucketProgress = (bucketId: string) => {
    const goals = bucketGoals[bucketId] || [];
    const completed = goals.filter(g => g.completed).length;
    return { completed, total: goals.length };
  };

  const filteredBuckets = useMemo(() => {
    let filtered = [...buckets];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bucket) =>
          bucket.name.toLowerCase().includes(query) ||
          bucket.description?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(bucket => bucket.type === filterType);
    }

    // Apply progress filter
    if (filterProgress !== 'all') {
      filtered = filtered.filter(bucket => {
        const goals = bucketGoals[bucket.id] || [];
        const completed = goals.filter(g => g.completed).length;
        const total = goals.length;
        if (filterProgress === 'completed') {
          return total > 0 && completed === total;
        } else if (filterProgress === 'in-progress') {
          return total > 0 && completed < total;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'progress') {
        const goalsA = bucketGoals[a.id] || [];
        const goalsB = bucketGoals[b.id] || [];
        const completedA = goalsA.filter(g => g.completed).length;
        const completedB = goalsB.filter(g => g.completed).length;
        const percentA = goalsA.length > 0 ? (completedA / goalsA.length) : 0;
        const percentB = goalsB.length > 0 ? (completedB / goalsB.length) : 0;
        return percentB - percentA; // Descending
      } else {
        // date (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [buckets, searchQuery, filterType, filterProgress, sortBy, bucketGoals]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserBuckets(user.id, (updatedBuckets) => {
      setBuckets(updatedBuckets);
      setLoading(false);
      
      // Subscribe to goals for each bucket to calculate progress
      updatedBuckets.forEach(bucket => {
        if (!bucketGoals[bucket.id]) {
          subscribeToBucketGoals(bucket.id, (goals) => {
            setBucketGoals(prev => ({
              ...prev,
              [bucket.id]: goals,
            }));
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleCoverImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const handleCreateBucket = async () => {
    if (!bucketName.trim() || !user) {
      window.alert('Please enter a bucket name');
      return;
    }

    setCreating(true);
    try {
      let coverImageBase64: string | undefined = undefined;
      if (coverImageFile) {
        try {
          coverImageBase64 = await compressAndConvertToBase64(coverImageFile, 1200);
        } catch (photoError) {
          console.error('Cover image compression error:', photoError);
          window.alert('Failed to process cover image. Creating bucket without cover image.');
        }
      }

      const bucketId = await createBucket(
        bucketName.trim(),
        bucketType,
        user.id,
        bucketDescription.trim() || undefined,
        undefined,
        { color: bucketColor, icon: bucketIcon }
      );

      // Update bucket with cover image if we have one
      if (coverImageBase64) {
        await updateBucket(bucketId, { coverImage: coverImageBase64 });
      }

      setShowCreateModal(false);
      setBucketName('');
      setBucketDescription('');
      setBucketType('solo');
      setBucketColor(BUCKET_COLORS[0]);
      setBucketIcon(BUCKET_ICONS[0]);
      setCoverImageFile(null);
      setCoverImagePreview(null);
    } catch (error: any) {
      window.alert(error.message || 'Failed to create bucket');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBucket = async (bucket: Bucket) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${bucket.name}"? This action cannot be undone.`
    );
    if (confirmed) {
      try {
        await deleteBucket(bucket.id);
      } catch (error: any) {
        window.alert(error.message || 'Failed to delete bucket');
      }
    }
  };

  const renderBucket = ({ item }: { item: Bucket }) => {
    const { completed, total } = getBucketProgress(item.id);
    return (
      <BucketCard
        bucket={item}
        onPress={() => {
          navigation.navigate('BucketDetail' as never, { bucketId: item.id } as never);
        }}
        onDelete={() => handleDeleteBucket(item)}
        completedGoals={completed}
        totalGoals={total}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 10);
      },
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const getUserDisplayName = () => {
    return user?.displayName?.split(' ')[0] || 'there';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>
            Hello, {getUserDisplayName()} 👋
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.filterIcon}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.addButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerTitle}>My Buckets</Text>
        
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search buckets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
              autoFocus
            />
          </View>
        )}
      </View>

      {/* Sticky Header Blur Overlay */}
      <Animated.View 
        style={[
          styles.stickyHeader,
          { opacity: headerOpacity },
        ]}
        pointerEvents="none"
      >
        <View style={styles.headerBlur} />
      </Animated.View>

      {filteredBuckets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No buckets found' : 'No buckets yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try adjusting your search'
              : 'Create your first bucket to get started!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBuckets}
          renderItem={renderBucket}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Bucket</Text>

            <TextInput
              style={styles.input}
              placeholder="Bucket Name"
              value={bucketName}
              onChangeText={setBucketName}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={bucketDescription}
              onChangeText={setBucketDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeContainer}>
              {(['solo', 'duo', 'group'] as BucketType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    bucketType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setBucketType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      bucketType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
              <View style={styles.iconContainer}>
                {BUCKET_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      bucketIcon === icon && styles.iconButtonActive,
                      bucketIcon === icon && { borderColor: bucketColor },
                    ]}
                    onPress={() => setBucketIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
              {BUCKET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    bucketColor === color && styles.colorButtonActive,
                  ]}
                  onPress={() => setBucketColor(color)}
                >
                  {bucketColor === color && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Cover Image (optional)</Text>
            {coverImagePreview ? (
              <View style={styles.coverImagePreview}>
                <Image
                  source={{ uri: coverImagePreview }}
                  style={styles.coverImagePreviewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeCoverButton}
                  onPress={removeCoverImage}
                >
                  <Text style={styles.removeCoverText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.fileInputContainer}>
                {typeof window !== 'undefined' && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    style={{ marginBottom: 8 }}
                  />
                )}
              </View>
            )}

            <View style={[styles.themePreview, { backgroundColor: bucketColor }]}>
              <Text style={styles.themePreviewIcon}>{bucketIcon}</Text>
              <Text style={styles.themePreviewText}>{bucketName || 'Bucket Name'}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setBucketName('');
                  setBucketDescription('');
                  setBucketColor(BUCKET_COLORS[0]);
                  setBucketIcon(BUCKET_ICONS[0]);
                  setCoverImageFile(null);
                  setCoverImagePreview(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateBucket}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter & Sort Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>

            <Text style={styles.label}>Filter by Type</Text>
            <View style={styles.typeContainer}>
              {(['all', 'solo', 'duo', 'group'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    filterType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      filterType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Filter by Progress</Text>
            <View style={styles.typeContainer}>
              {(['all', 'in-progress', 'completed'] as const).map((progress) => (
                <TouchableOpacity
                  key={progress}
                  style={[
                    styles.typeButton,
                    filterProgress === progress && styles.typeButtonActive,
                  ]}
                  onPress={() => setFilterProgress(progress)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      filterProgress === progress && styles.typeButtonTextActive,
                    ]}
                  >
                    {progress === 'all' ? 'All' : progress === 'in-progress' ? 'In Progress' : 'Completed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Sort By</Text>
            <View style={styles.typeContainer}>
              {(['date', 'name', 'progress'] as const).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.typeButton,
                    sortBy === sort && styles.typeButtonActive,
                  ]}
                  onPress={() => setSortBy(sort)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      sortBy === sort && styles.typeButtonTextActive,
                    ]}
                  >
                    {sort === 'date' ? 'Date Created' : sort === 'name' ? 'Name' : 'Progress'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={() => {
                  setFilterType('all');
                  setFilterProgress('all');
                  setSortBy('date');
                }}
              >
                <Text style={styles.clearButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 99,
    overflow: 'hidden',
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
    color: '#64748b',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  filterIcon: {
    fontSize: 16,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    letterSpacing: -0.5,
  },
  searchContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  listContent: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconScrollView: {
    marginBottom: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  iconButtonActive: {
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  iconText: {
    fontSize: 22,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonActive: {
    borderWidth: 3,
    borderColor: '#000',
  },
  colorCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  themePreviewIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  themePreviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInputContainer: {
    marginBottom: 16,
  },
  coverImagePreview: {
    marginBottom: 16,
    position: 'relative',
  },
  coverImagePreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  removeCoverButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  removeCoverText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
});

