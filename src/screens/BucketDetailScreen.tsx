import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoalItem } from '../components/GoalItem';
import { useAuth } from '../context/AuthContext';
import {
  getBucket,
  subscribeToBucketGoals,
  createGoal,
  toggleGoalCompletion,
  deleteGoal,
  updateGoal,
  updateBucket,
  toggleGoalFavorite,
  addBucketMember,
  removeBucketMember,
  deleteBucket,
  compressAndConvertToBase64,
} from '../services/bucketService';
import { getUserByEmail } from '../services/authService';
import { getUserFriends } from '../services/friendService';
import { Bucket, Goal, BucketType, User, BUCKET_COLORS, BUCKET_ICONS, BucketTheme, GOAL_CATEGORIES } from '../types';

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'date' | 'favorites' | 'dueDate' | 'title' | 'category';

// Helper to parse date string as local time (not UTC)
const parseLocalDate = (dateString: string): Date | null => {
  if (!dateString.trim()) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0); // Noon local time
  return isNaN(date.getTime()) ? null : date;
};

interface BucketDetailScreenProps {
  route: {
    params: {
      bucketId: string;
    };
  };
}

export const BucketDetailScreen: React.FC<BucketDetailScreenProps> = ({ route }) => {
  const { bucketId } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [showEditBucketModal, setShowEditBucketModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDueDate, setGoalDueDate] = useState<string>('');
  const [goalCompleted, setGoalCompleted] = useState(false);
  const [goalCompletedAt, setGoalCompletedAt] = useState<string>('');
  const [goalCategories, setGoalCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBucketName, setEditBucketName] = useState('');
  const [editBucketDescription, setEditBucketDescription] = useState('');
  const [editBucketType, setEditBucketType] = useState<BucketType>('solo');
  const [editBucketColor, setEditBucketColor] = useState(BUCKET_COLORS[0]);
  const [editBucketIcon, setEditBucketIcon] = useState(BUCKET_ICONS[0]);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [updatingBucket, setUpdatingBucket] = useState(false);
  const [editBucketCoverImageFile, setEditBucketCoverImageFile] = useState<File | null>(null);
  const [editBucketCoverImagePreview, setEditBucketCoverImagePreview] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberUsers, setMemberUsers] = useState<User[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingGoal, setCompletingGoal] = useState<Goal | null>(null);
  const [completionPhotoFiles, setCompletionPhotoFiles] = useState<File[]>([]);
  const [completionPhotoPreviews, setCompletionPhotoPreviews] = useState<string[]>([]);
  const [completionDate, setCompletionDate] = useState<string>('');
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [editGoalCompletedAt, setEditGoalCompletedAt] = useState<string>('');
  const [editGoalExistingPhotos, setEditGoalExistingPhotos] = useState<string[]>([]);
  const [editGoalNewPhotoFiles, setEditGoalNewPhotoFiles] = useState<File[]>([]);
  const [editGoalNewPhotoPreviews, setEditGoalNewPhotoPreviews] = useState<string[]>([]);
  const [completionJournal, setCompletionJournal] = useState<string>('');
  const [editGoalJournal, setEditGoalJournal] = useState<string>('');
  const [showShareFriendsModal, setShowShareFriendsModal] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  useEffect(() => {
    loadBucket();
    const unsubscribe = subscribeToBucketGoals(bucketId, (updatedGoals) => {
      setAllGoals(updatedGoals);
    });

    return () => unsubscribe();
  }, [bucketId]);

  const loadBucket = async () => {
    try {
      const bucketData = await getBucket(bucketId);
      setBucket(bucketData);
      if (bucketData) {
        setEditBucketName(bucketData.name);
        setEditBucketDescription(bucketData.description || '');
        setEditBucketType(bucketData.type);
        setEditBucketColor(bucketData.theme?.color || BUCKET_COLORS[0]);
        setEditBucketIcon(bucketData.theme?.icon || BUCKET_ICONS[0]);
        setEditBucketCoverImagePreview(bucketData.coverImage || null);
      }
      setLoading(false);
    } catch (error: any) {
      window.alert(error.message || 'Failed to load bucket');
      setLoading(false);
    }
  };

  const filteredAndSortedGoals = useMemo(() => {
    let filtered = [...allGoals];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (goal) =>
          goal.title.toLowerCase().includes(query) ||
          goal.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter((goal) => !goal.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter((goal) => goal.completed);
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((goal) => goal.categories?.includes(categoryFilter));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sort === 'favorites') {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      if (sort === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'category') {
        const catA = a.categories?.[0] || '';
        const catB = b.categories?.[0] || '';
        if (catA !== catB) {
          if (!catA) return 1;
          if (!catB) return -1;
          return catA.localeCompare(catB);
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      // Default: date (newest first for active, oldest first for completed)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.completed && b.completed) {
        return (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0);
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return filtered;
  }, [allGoals, filter, sort, searchQuery, categoryFilter]);

  const handleCreateGoal = async () => {
    if (!goalTitle.trim() || !user) {
      window.alert('Please enter a goal title');
      return;
    }

    setCreating(true);
    try {
      let dueDate: Date | undefined = undefined;
      if (goalDueDate.trim()) {
        const parsedDate = parseLocalDate(goalDueDate);
        if (!parsedDate) {
          window.alert('Please enter a valid date (YYYY-MM-DD)');
          setCreating(false);
          return;
        }
        dueDate = parsedDate;
      }

      let completedAt: Date | undefined = undefined;
      if (goalCompleted && goalCompletedAt.trim()) {
        const parsedCompletedAt = parseLocalDate(goalCompletedAt);
        if (!parsedCompletedAt) {
          window.alert('Please enter a valid completion date (YYYY-MM-DD)');
          setCreating(false);
          return;
        }
        completedAt = parsedCompletedAt;
      } else if (goalCompleted) {
        // If marked as completed but no date provided, use today
        completedAt = new Date();
      }

      await createGoal(
        bucketId,
        goalTitle.trim(),
        user.id,
        goalDescription.trim() || undefined,
        dueDate,
        goalCompleted,
        completedAt,
        goalCategories.length > 0 ? goalCategories : undefined
      );
      setShowAddGoalModal(false);
      setGoalTitle('');
      setGoalDescription('');
      setGoalDueDate('');
      setGoalCategories([]);
      setGoalCompleted(false);
      setGoalCompletedAt('');
    } catch (error: any) {
      window.alert(error.message || 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description || '');
    setGoalDueDate(goal.dueDate ? goal.dueDate.toISOString().split('T')[0] : '');
    setEditGoalCompletedAt(goal.completedAt ? goal.completedAt.toISOString().split('T')[0] : '');
    setEditGoalExistingPhotos(goal.completionPhotos || []);
    setEditGoalNewPhotoFiles([]);
    setEditGoalNewPhotoPreviews([]);
    setEditGoalJournal(goal.memoryJournal || '');
    setGoalCategories(goal.categories || []);
    setShowEditGoalModal(true);
  };

  const handleEditPhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setEditGoalNewPhotoFiles(prev => [...prev, ...fileArray]);
      
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditGoalNewPhotoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEditExistingPhoto = (index: number) => {
    setEditGoalExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditNewPhoto = (index: number) => {
    setEditGoalNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setEditGoalNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateGoal = async () => {
    if (!goalTitle.trim() || !editingGoal) {
      window.alert('Please enter a goal title');
      return;
    }

    setEditing(true);
    try {
      let dueDate: Date | undefined = undefined;
      if (goalDueDate.trim()) {
        const parsedDate = parseLocalDate(goalDueDate);
        if (!parsedDate) {
          window.alert('Please enter a valid due date (YYYY-MM-DD)');
          setEditing(false);
          return;
        }
        dueDate = parsedDate;
      }

      let completedAt: Date | undefined = undefined;
      if (editingGoal.completed && editGoalCompletedAt.trim()) {
        const parsedCompletedAt = parseLocalDate(editGoalCompletedAt);
        if (!parsedCompletedAt) {
          window.alert('Please enter a valid completion date (YYYY-MM-DD)');
          setEditing(false);
          return;
        }
        completedAt = parsedCompletedAt;
      }

      // Process new photos if any
      let newPhotoBase64List: string[] = [];
      if (editGoalNewPhotoFiles.length > 0) {
        try {
          const compressionPromises = editGoalNewPhotoFiles.map(file => 
            compressAndConvertToBase64(file)
          );
          newPhotoBase64List = await Promise.all(compressionPromises);
        } catch (photoError) {
          console.error('Photo compression error:', photoError);
          window.alert('Failed to process some photos.');
        }
      }

      const updates: any = {
        title: goalTitle.trim(),
        description: goalDescription.trim() || undefined,
        dueDate,
        categories: goalCategories.length > 0 ? goalCategories : [],
      };

      // Only include completedAt if editing a completed goal
      if (editingGoal.completed && completedAt) {
        updates.completedAt = completedAt;
      }

      // Include photos and journal if this is a completed goal
      if (editingGoal.completed) {
        updates.completionPhotos = [...editGoalExistingPhotos, ...newPhotoBase64List];
        updates.memoryJournal = editGoalJournal.trim() || undefined;
      }

      await updateGoal(editingGoal.bucketId, editingGoal.id, updates);
      setShowEditGoalModal(false);
      setEditingGoal(null);
      setGoalTitle('');
      setGoalDescription('');
      setGoalDueDate('');
      setGoalCategories([]);
      setEditGoalExistingPhotos([]);
      setEditGoalNewPhotoFiles([]);
      setEditGoalNewPhotoPreviews([]);
      setEditGoalJournal('');
      setEditGoalCompletedAt('');
    } catch (error: any) {
      window.alert(error.message || 'Failed to update goal');
    } finally {
      setEditing(false);
    }
  };

  const handleToggleGoal = async (goal: Goal) => {
    if (!goal.completed) {
      // Show completion modal when completing a goal
      setCompletingGoal(goal);
      setCompletionPhotoFiles([]);
      setCompletionPhotoPreviews([]);
      setCompletionJournal('');
      setCompletionDate(new Date().toISOString().split('T')[0]); // Default to today
      setShowCompleteModal(true);
    } else {
      // Directly uncomplete when already completed
      try {
        await updateGoal(bucketId, goal.id, { completed: false, completionPhotos: [], memoryJournal: '' });
      } catch (error: any) {
        window.alert(error.message || 'Failed to update goal');
      }
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setCompletionPhotoFiles(prev => [...prev, ...fileArray]);
      
      // Create preview URLs for all new files
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCompletionPhotoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhotoPreview = (index: number) => {
    setCompletionPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setCompletionPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteWithPhoto = async () => {
    if (!completingGoal) return;

    setSavingCompletion(true);
    try {
      let photoBase64List: string[] = [];
      
      // Compress and convert all photos
      if (completionPhotoFiles.length > 0) {
        try {
          const compressionPromises = completionPhotoFiles.map(file => 
            compressAndConvertToBase64(file)
          );
          photoBase64List = await Promise.all(compressionPromises);
        } catch (photoError) {
          console.error('Photo compression error:', photoError);
          window.alert('Failed to process some photos. Completing without photos.');
        }
      }

      // Parse completion date
      let completedAt: Date | undefined = undefined;
      if (completionDate.trim()) {
        completedAt = parseLocalDate(completionDate) || undefined;
        if (!completedAt) {
          window.alert('Please enter a valid date');
          setSavingCompletion(false);
          return;
        }
      }

      await updateGoal(bucketId, completingGoal.id, {
        completed: true,
        completedAt,
        completionPhotos: [...(completingGoal.completionPhotos || []), ...photoBase64List],
        memoryJournal: completionJournal.trim() || undefined,
      });
      setShowCompleteModal(false);
      setCompletingGoal(null);
      setCompletionPhotoFiles([]);
      setCompletionPhotoPreviews([]);
      setCompletionJournal('');
      setCompletionDate('');
    } catch (error: any) {
      window.alert(error.message || 'Failed to complete goal');
    } finally {
      setSavingCompletion(false);
    }
  };

  const handleToggleFavorite = async (goal: Goal) => {
    try {
      await toggleGoalFavorite(bucketId, goal.id, !goal.isFavorite);
    } catch (error: any) {
      window.alert(error.message || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goal: Goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${goal.title}"?`
    );
    if (confirmed) {
      try {
        await deleteGoal(bucketId, goal.id);
      } catch (error: any) {
        window.alert(error.message || 'Failed to delete goal');
      }
    }
  };

  const handleEditCoverImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditBucketCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditBucketCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditCoverImage = () => {
    setEditBucketCoverImageFile(null);
    setEditBucketCoverImagePreview(null);
  };

  const handleUpdateBucket = async () => {
    if (!editBucketName.trim()) {
      window.alert('Please enter a bucket name');
      return;
    }

    setUpdatingBucket(true);
    try {
      let coverImageBase64: string | undefined = undefined;
      
      // If there's a new cover image file, compress and convert it
      if (editBucketCoverImageFile) {
        try {
          coverImageBase64 = await compressAndConvertToBase64(editBucketCoverImageFile, 1200);
        } catch (photoError) {
          console.error('Cover image compression error:', photoError);
          window.alert('Failed to process cover image. Updating bucket without cover image.');
        }
      } else if (editBucketCoverImagePreview && bucket?.coverImage === editBucketCoverImagePreview) {
        // Keep existing cover image if no new file was selected
        coverImageBase64 = editBucketCoverImagePreview;
      }

      await updateBucket(bucketId, {
        name: editBucketName.trim(),
        description: editBucketDescription.trim() || undefined,
        type: editBucketType,
        theme: { color: editBucketColor, icon: editBucketIcon },
        coverImage: coverImageBase64,
      });
      setShowEditBucketModal(false);
      setShowThemeModal(false);
      setEditBucketCoverImageFile(null);
      // Don't reset preview here - let loadBucket handle it
      await loadBucket();
    } catch (error: any) {
      window.alert(error.message || 'Failed to update bucket');
    } finally {
      setUpdatingBucket(false);
    }
  };

  const loadMemberUsers = async () => {
    if (!bucket) return;
    try {
      const { getUserProfile } = await import('../services/authService');
      const users = await Promise.all(
        bucket.members.map((member) => getUserProfile(member.userId))
      );
      setMemberUsers(users.filter((u): u is User => u !== null));
    } catch (error) {
      console.error('Error loading member users:', error);
    }
  };

  const loadFriends = async () => {
    if (!user?.id) return;
    setLoadingFriends(true);
    try {
      const friendsList = await getUserFriends(user.id);
      // Filter out friends who are already members
      const existingMemberIds = new Set(bucket?.members.map(m => m.userId) || []);
      const availableFriends = friendsList.filter(f => !existingMemberIds.has(f.id));
      setFriends(availableFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
      window.alert('Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleShareWithFriend = async (friendId: string) => {
    try {
      await addBucketMember(bucketId, friendId);
      await loadBucket();
      await loadMemberUsers();
      setShowShareFriendsModal(false);
      window.alert('Friend added to bucket!');
    } catch (error: any) {
      window.alert(error.message || 'Failed to add friend to bucket');
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      window.alert('Please enter an email address');
      return;
    }

    setAddingMember(true);
    try {
      const foundUser = await getUserByEmail(memberEmail.trim());
      if (!foundUser) {
        window.alert('User not found with that email address');
        return;
      }

      if (foundUser.id === user?.id) {
        window.alert('You cannot add yourself as a member');
        return;
      }

      if (bucket?.members.some((m) => m.userId === foundUser.id)) {
        window.alert('User is already a member');
        return;
      }

      await addBucketMember(bucketId, foundUser.id);
      setMemberEmail('');
      await loadBucket();
      await loadMemberUsers();
      window.alert(`Added ${foundUser.displayName} to the bucket`);
    } catch (error: any) {
      window.alert(error.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (memberUserId === bucket?.ownerId) {
      window.alert('Cannot remove the bucket owner');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this bucket?`
    );
    if (confirmed) {
      try {
        await removeBucketMember(bucketId, memberUserId);
        await loadBucket();
        await loadMemberUsers();
      } catch (error: any) {
        window.alert(error.message || 'Failed to remove member');
      }
    }
  };

  const handleDeleteBucket = async () => {
    if (!bucket) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${bucket.name}"? This action cannot be undone and will delete all goals in this bucket.`
    );
    if (confirmed) {
      try {
        await deleteBucket(bucketId);
        navigation.goBack();
      } catch (error: any) {
        window.alert(error.message || 'Failed to delete bucket');
      }
    }
  };

  const handleUpdateMemory = async (goalId: string, journal: string) => {
    try {
      await updateGoal(bucketId, goalId, { memoryJournal: journal.trim() || undefined });
    } catch (error: any) {
      window.alert(error.message || 'Failed to update memory');
    }
  };

  const renderGoal = ({ item }: { item: Goal }) => (
    <GoalItem
      goal={item}
      onToggle={() => handleToggleGoal(item)}
      onFavorite={() => handleToggleFavorite(item)}
      onEdit={() => handleEditGoal(item)}
      onDelete={() => handleDeleteGoal(item)}
      onUpdateMemory={(journal) => handleUpdateMemory(item.id, journal)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!bucket) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Bucket not found</Text>
      </View>
    );
  }

  const completedGoals = allGoals.filter((g) => g.completed).length;
  const totalGoals = allGoals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const themeColor = bucket.theme?.color || '#007AFF';
  const themeIcon = bucket.theme?.icon || '🎯';

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <View style={styles.bucketNameRow}>
              <Text style={styles.bucketIcon}>{themeIcon}</Text>
              <Text style={styles.bucketName}>{bucket.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => setShowThemeModal(true)} 
                style={styles.headerActionButton}
              >
                <Text style={styles.headerActionIcon}>🎨</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowEditBucketModal(true)}
                style={styles.headerActionButton}
              >
                <Text style={styles.headerActionIcon}>✏️</Text>
              </TouchableOpacity>
              {user?.id === bucket.ownerId && (
                <TouchableOpacity
                  onPress={() => {
                    console.log('Delete bucket header button pressed');
                    handleDeleteBucket();
                  }}
                  style={styles.headerActionButton}
                >
                  <Text style={styles.headerActionIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {bucket.description && (
            <Text style={styles.bucketDescription}>{bucket.description}</Text>
          )}
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressText}>
              {completedGoals} / {totalGoals} completed
            </Text>
            <View style={styles.progressRingContainer}>
              <View style={[styles.progressRing, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={styles.progressRingText}>{Math.round(progress)}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressBarThin}>
            <View
              style={[styles.progressFillThin, { width: `${progress}%`, backgroundColor: 'rgba(255,255,255,0.9)' }]}
            />
          </View>
        </View>
        {(bucket.type === 'duo' || bucket.type === 'group') && (
          <TouchableOpacity
            style={styles.membersButton}
            onPress={async () => {
              setShowMembersModal(true);
              await loadMemberUsers();
            }}
          >
            <Text style={styles.membersButtonText}>
              👥 Members ({bucket.members.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fixed Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search goals..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Scrollable Content: Filters and Goals */}
      <ScrollView 
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Filter:</Text>
              {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, filter === f && styles.filterPillActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.filterLabel}>Sort:</Text>
              {(['date', 'favorites', 'dueDate', 'title', 'category'] as SortType[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterPill, sort === s && styles.filterPillActive]}
                  onPress={() => setSort(s)}
                >
                  <Text style={[styles.filterPillText, sort === s && styles.filterPillTextActive]}>
                    {s === 'dueDate' ? 'Due Date' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.filterRowSpacer} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Category:</Text>
              <TouchableOpacity
                style={[styles.filterPill, !categoryFilter && styles.filterPillActive]}
                onPress={() => setCategoryFilter('')}
              >
                <Text style={[styles.filterPillText, !categoryFilter && styles.filterPillTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {GOAL_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterPill,
                    categoryFilter === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategoryFilter(cat.id)}
                >
                  <Text style={[
                    styles.filterPillText,
                    categoryFilter === cat.id && styles.filterPillTextActive,
                  ]}>
                    {cat.icon} {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.goalsHeader}>
        <Text style={styles.goalsTitle}>Goals ({filteredAndSortedGoals.length})</Text>
        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => setShowAddGoalModal(true)}
        >
          <Text style={styles.addGoalButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

        {filteredAndSortedGoals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No goals found' : 'No goals yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Add your first goal to get started!'}
            </Text>
          </View>
        ) : (
          <View style={styles.goalsListContainer}>
            {filteredAndSortedGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onToggle={() => handleToggleGoal(goal)}
                onFavorite={() => handleToggleFavorite(goal)}
                onEdit={() => handleEditGoal(goal)}
                onDelete={() => handleDeleteGoal(goal)}
                onUpdateMemory={(journal) => handleUpdateMemory(goal.id, journal)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>

            <TextInput
              style={styles.input}
              placeholder="Goal Title *"
              value={goalTitle}
              onChangeText={setGoalTitle}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={goalDescription}
              onChangeText={setGoalDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD, optional)"
              value={goalDueDate}
              onChangeText={setGoalDueDate}
            />

            <Text style={styles.label}>Categories (tap to select multiple)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
              <View style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    goalCategories.length === 0 && styles.categoryOptionActive,
                  ]}
                  onPress={() => setGoalCategories([])}
                >
                  <Text style={[styles.categoryOptionText, goalCategories.length === 0 && { color: '#fff' }]}>None</Text>
                </TouchableOpacity>
                {GOAL_CATEGORIES.map((cat) => {
                  const isSelected = goalCategories.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        { borderColor: cat.color },
                        isSelected && { backgroundColor: cat.color },
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setGoalCategories(goalCategories.filter(c => c !== cat.id));
                        } else {
                          setGoalCategories([...goalCategories, cat.id]);
                        }
                      }}
                    >
                      <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryOptionText,
                        isSelected && { color: '#fff' },
                      ]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setGoalCompleted(!goalCompleted)}
            >
              <View style={[styles.checkbox, goalCompleted && styles.checkboxChecked]}>
                {goalCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Already completed</Text>
            </TouchableOpacity>

            {goalCompleted && (
              <TextInput
                style={styles.input}
                placeholder="Completed on (YYYY-MM-DD, defaults to today)"
                value={goalCompletedAt}
                onChangeText={setGoalCompletedAt}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddGoalModal(false);
                  setGoalTitle('');
                  setGoalDescription('');
                  setGoalDueDate('');
                  setGoalCategories([]);
                  setGoalCompleted(false);
                  setGoalCompletedAt('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGoal}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        visible={showEditGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Goal</Text>

            <TextInput
              style={styles.input}
              placeholder="Goal Title *"
              value={goalTitle}
              onChangeText={setGoalTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={goalDescription}
              onChangeText={setGoalDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD, optional)"
              value={goalDueDate}
              onChangeText={setGoalDueDate}
            />

            <Text style={styles.label}>Categories (tap to select multiple)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
              <View style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    goalCategories.length === 0 && styles.categoryOptionActive,
                  ]}
                  onPress={() => setGoalCategories([])}
                >
                  <Text style={[styles.categoryOptionText, goalCategories.length === 0 && { color: '#fff' }]}>None</Text>
                </TouchableOpacity>
                {GOAL_CATEGORIES.map((cat) => {
                  const isSelected = goalCategories.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        { borderColor: cat.color },
                        isSelected && { backgroundColor: cat.color },
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setGoalCategories(goalCategories.filter(c => c !== cat.id));
                        } else {
                          setGoalCategories([...goalCategories, cat.id]);
                        }
                      }}
                    >
                      <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryOptionText,
                        isSelected && { color: '#fff' },
                      ]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {editingGoal?.completed && (
              <>
                <Text style={styles.label}>Completion Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={editGoalCompletedAt}
                  onChangeText={setEditGoalCompletedAt}
                />

                <Text style={styles.label}>Photos</Text>
                
                {/* Existing photos */}
                {editGoalExistingPhotos.length > 0 && (
                  <View style={styles.photoPreview}>
                    <Text style={styles.photoPreviewLabel}>
                      Current photos ({editGoalExistingPhotos.length}):
                    </Text>
                    <View style={styles.photoPreviewGrid}>
                      {editGoalExistingPhotos.map((photo, index) => (
                        <View key={`existing-${index}`} style={styles.photoPreviewItem}>
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => removeEditExistingPhoto(index)}
                          >
                            <Text style={styles.removePhotoText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Add new photos */}
                <View style={styles.fileInputContainer}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditPhotoSelect}
                    style={{ marginBottom: 8 }}
                  />
                </View>

                {/* New photo previews */}
                {editGoalNewPhotoPreviews.length > 0 && (
                  <View style={styles.photoPreview}>
                    <Text style={styles.photoPreviewLabel}>
                      New photos to add ({editGoalNewPhotoPreviews.length}):
                    </Text>
                    <View style={styles.photoPreviewGrid}>
                      {editGoalNewPhotoPreviews.map((preview, index) => (
                        <View key={`new-${index}`} style={styles.photoPreviewItem}>
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => removeEditNewPhoto(index)}
                          >
                            <Text style={styles.removePhotoText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <Text style={styles.label}>Memory Journal</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write about this achievement..."
                  value={editGoalJournal}
                  onChangeText={setEditGoalJournal}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditGoalModal(false);
                  setEditingGoal(null);
                  setGoalTitle('');
                  setGoalDescription('');
                  setGoalDueDate('');
                  setGoalCategories([]);
                  setEditGoalCompletedAt('');
                  setEditGoalExistingPhotos([]);
                  setEditGoalNewPhotoFiles([]);
                  setEditGoalNewPhotoPreviews([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleUpdateGoal}
                disabled={editing}
              >
                {editing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Bucket Modal */}
      <Modal
        visible={showEditBucketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditBucketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Bucket</Text>

            <TextInput
              style={styles.input}
              placeholder="Bucket Name *"
              value={editBucketName}
              onChangeText={setEditBucketName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={editBucketDescription}
              onChangeText={setEditBucketDescription}
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
                    editBucketType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setEditBucketType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      editBucketType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Cover Image (optional)</Text>
            {editBucketCoverImagePreview ? (
              <View style={styles.coverImagePreview}>
                <Image
                  source={{ uri: editBucketCoverImagePreview }}
                  style={styles.coverImagePreviewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeCoverButton}
                  onPress={removeEditCoverImage}
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
                    onChange={handleEditCoverImageSelect}
                    style={{ marginBottom: 8 }}
                  />
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditBucketModal(false);
                  setEditBucketCoverImageFile(null);
                  // Reset preview to current bucket's cover image
                  setEditBucketCoverImagePreview(bucket?.coverImage || null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleUpdateBucket}
                disabled={updatingBucket}
              >
                {updatingBucket ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Theme Customization Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎨 Customize Theme</Text>

            <Text style={styles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
              <View style={styles.iconContainer}>
                {BUCKET_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      editBucketIcon === icon && styles.iconButtonActive,
                      editBucketIcon === icon && { borderColor: editBucketColor },
                    ]}
                    onPress={() => setEditBucketIcon(icon)}
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
                    editBucketColor === color && styles.colorButtonActive,
                  ]}
                  onPress={() => setEditBucketColor(color)}
                >
                  {editBucketColor === color && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.themePreview, { backgroundColor: editBucketColor }]}>
              <Text style={styles.themePreviewIcon}>{editBucketIcon}</Text>
              <Text style={styles.themePreviewText}>{bucket?.name || 'Bucket Name'}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowThemeModal(false);
                  setEditBucketColor(bucket?.theme?.color || BUCKET_COLORS[0]);
                  setEditBucketIcon(bucket?.theme?.icon || BUCKET_ICONS[0]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: editBucketColor }]}
                onPress={handleUpdateBucket}
                disabled={updatingBucket}
              >
                {updatingBucket ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bucket Members</Text>

            {bucket && (bucket.type === 'duo' || bucket.type === 'group') && (
              <>
                <View style={styles.addMemberContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    value={memberEmail}
                    onChangeText={setMemberEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={handleAddMember}
                    disabled={addingMember}
                  >
                    {addingMember ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.addMemberButtonText}>Add</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.shareFriendsButton}
                  onPress={async () => {
                    setShowShareFriendsModal(true);
                    await loadFriends();
                  }}
                >
                  <Text style={styles.shareFriendsButtonText}>👥 Share with Friends</Text>
                </TouchableOpacity>

                <ScrollView style={styles.membersList}>
                  {memberUsers.map((memberUser) => {
                    const member = bucket.members.find((m) => m.userId === memberUser.id);
                    const isOwner = member?.role === 'owner';
                    const isCurrentUser = memberUser.id === user?.id;
                    return (
                      <View key={memberUser.id} style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>
                            {memberUser.displayName} {isOwner && '(Owner)'}
                            {isCurrentUser && ' (You)'}
                          </Text>
                          <Text style={styles.memberEmail}>{memberUser.email}</Text>
                        </View>
                        {!isOwner && user?.id === bucket.ownerId && (
                          <TouchableOpacity
                            style={styles.removeMemberButton}
                            onPress={() => handleRemoveMember(memberUser.id, memberUser.displayName)}
                          >
                            <Text style={styles.removeMemberButtonText}>Remove</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowMembersModal(false);
                setMemberEmail('');
              }}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share with Friends Modal */}
      <Modal
        visible={showShareFriendsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShareFriendsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share with Friends</Text>

            {loadingFriends ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends available</Text>
                <Text style={styles.emptySubtext}>
                  Add friends from your profile to share buckets with them!
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.friendsList}>
                {friends.map((friend) => (
                  <View key={friend.id} style={styles.friendItem}>
                    <View style={styles.friendInfo}>
                      {friend.photoURL ? (
                        <Image source={{ uri: friend.photoURL }} style={styles.friendAvatar} />
                      ) : (
                        <View style={styles.friendAvatarFallback}>
                          <Text style={styles.friendAvatarText}>
                            {friend.displayName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.friendDetails}>
                        <Text style={styles.friendName}>{friend.displayName}</Text>
                        <Text style={styles.friendEmail}>{friend.email}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => handleShareWithFriend(friend.id)}
                    >
                      <Text style={styles.shareButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowShareFriendsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Complete Goal Modal */}
      <Modal
        visible={showCompleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Complete Goal</Text>
            <Text style={styles.completingGoalTitle}>{completingGoal?.title}</Text>

            <Text style={styles.label}>Completion Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={completionDate}
              onChangeText={setCompletionDate}
            />

            <Text style={styles.label}>Add photos (optional)</Text>
            <View style={styles.fileInputContainer}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                style={{ marginBottom: 12 }}
              />
            </View>

            {completionPhotoPreviews.length > 0 && (
              <View style={styles.photoPreview}>
                <Text style={styles.photoPreviewLabel}>
                  {completionPhotoPreviews.length} photo{completionPhotoPreviews.length > 1 ? 's' : ''} selected:
                </Text>
                <View style={styles.photoPreviewGrid}>
                  {completionPhotoPreviews.map((preview, index) => (
                    <View key={index} style={styles.photoPreviewItem}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhotoPreview(index)}
                      >
                        <Text style={styles.removePhotoText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.label}>Memory Journal (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write about this achievement..."
              value={completionJournal}
              onChangeText={setCompletionJournal}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCompleteModal(false);
                  setCompletingGoal(null);
                  setCompletionPhotoFiles([]);
                  setCompletionPhotoPreviews([]);
                  setCompletionJournal('');
                  setCompletionDate('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCompleteWithPhoto}
                disabled={savingCompletion}
              >
                {savingCompletion ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Complete ✓</Text>
                )}
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollableContent: {
    flex: 1,
  },
  header: {
    padding: 10,
    paddingVertical: 6,
    borderBottomWidth: 0,
  },
  headerTop: {
    marginBottom: 4,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bucketNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bucketIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  bucketName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionButton: {
    padding: 6,
  },
  headerActionIcon: {
    fontSize: 16,
  },
  bucketDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressRingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  progressBarThin: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillThin: {
    height: '100%',
    borderRadius: 2,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterRowSpacer: {
    height: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginRight: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterPillActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  addGoalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addGoalButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  goalsListContainer: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  completingGoalTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  photoPreview: {
    marginBottom: 16,
  },
  photoPreviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  photoPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoPreviewItem: {
    position: 'relative',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  photoPreviewImageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  photoPreviewUrl: {
    fontSize: 12,
    color: '#007AFF',
  },
  fileInputContainer: {
    marginBottom: 8,
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
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
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  membersButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  membersButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  addMemberContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addMemberButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 80,
  },
  addMemberButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  membersList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
  },
  removeMemberButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  removeMemberButtonText: {
    color: '#ff3b30',
    fontSize: 12,
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
  categoryScrollView: {
    marginBottom: 12,
    maxHeight: 50,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  categoryOptionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  categoryOptionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  shareFriendsButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  shareFriendsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  friendsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
