import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, Image, ScrollView, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useBucketStore } from '../store/bucketStore';
import { 
  subscribeToFriends, 
  sendFriendRequest, 
  searchUsers, 
  acceptFriendRequest, 
  rejectFriendRequest,
  removeFriend,
  subscribeToFriendRequests,
} from '../services/friendService';
import { User, FriendRequest } from '../types';

// Toast Component
const Toast: React.FC<{ visible: boolean; message: string; onHide: () => void }> = ({ visible, message, onHide }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, signOut, updateProfile } = useAuth();
  const { buckets, goals } = useBucketStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [updating, setUpdating] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingRequestUsers, setPendingRequestUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  // Subscribe to buckets when user is available
  useEffect(() => {
    if (!user?.id) return;
    
    const store = useBucketStore.getState();
    store.subscribeToBuckets(user.id);
    
    return () => {
      // Cleanup handled by store
    };
  }, [user?.id]);

  // Subscribe to goals for all buckets when buckets change
  useEffect(() => {
    const store = useBucketStore.getState();
    const currentGoalIds = Object.keys(goals);
    
    buckets.forEach(bucket => {
      if (!currentGoalIds.includes(bucket.id)) {
        store.subscribeToGoals(bucket.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets.map(b => b.id).join(',')]);

  // Subscribe to friends
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToFriends(user.id, (updatedFriends) => {
      setFriends(updatedFriends);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Subscribe to friend requests
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToFriendRequests(user.id, async (requests) => {
      setFriendRequests(requests);
      
      // Load user profiles for pending requests
      const pending = requests.filter(r => r.status === 'pending' && r.toUserId === user.id);
      if (pending.length > 0) {
        const { getUserProfile } = await import('../services/authService');
        const users: Record<string, User> = {};
        await Promise.all(
          pending.map(async (request) => {
            const profile = await getUserProfile(request.fromUserId);
            if (profile) {
              users[request.id] = profile;
            }
          })
        );
        setPendingRequestUsers(users);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Search users when query changes
  useEffect(() => {
    if (!searchQuery.trim() || !user?.id) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery, user.id);
        setSearchResults(results);
      } catch (error: any) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, user?.id]);

  // Calculate Life Stats
  const lifeStats = useMemo(() => {
    const allGoals = Object.values(goals).flat();
    const completedGoals = allGoals.filter(g => g.completed).length;
    const activeBuckets = buckets.filter(b => {
      const bucketGoals = goals[b.id] || [];
      return bucketGoals.some(g => !g.completed);
    }).length;

    return {
      goalsCompleted: completedGoals,
      activeBuckets,
      friends: friends.length,
    };
  }, [buckets, goals, friends]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSignOut = async () => {
    // Show confirmation dialog
    const confirmSignOut = async () => {
      try {
        console.log('Starting sign out process...');
        // Clear bucket store state before signing out
        useBucketStore.getState().clearState();
        console.log('Bucket store cleared');
        // Sign out - this will trigger navigation to login screen via AppNavigator
        await signOut();
        console.log('SignOut completed');
        // The navigation will happen automatically when user state becomes null
      } catch (error: any) {
        console.error('Sign out error:', error);
        Alert.alert('Error', error.message || 'Failed to sign out');
      }
    };

    // Use window.confirm for web compatibility, Alert for native
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      // Web platform - use window.confirm
      if (window.confirm('Are you sure you want to sign out?')) {
        await confirmSignOut();
      }
    } else {
      // Native platform - use Alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: confirmSignOut,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim() || !user) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        photoURL: photoURL.trim() || undefined,
      });
      setShowEditModal(false);
      showToast('Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user?.id) return;

    try {
      await sendFriendRequest(user.id, toUserId);
      showToast('Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      showToast('Friend request accepted!');
      // Force refresh friends list to ensure both users see the update
      if (user?.id) {
        // Small delay to ensure Firestore has updated
        setTimeout(async () => {
          const { getUserFriends } = await import('../services/friendService');
          const updatedFriends = await getUserFriends(user.id);
          setFriends(updatedFriends);
        }, 500);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      showToast('Friend request rejected');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!user?.id) return;

    const confirmed = Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm
      ? window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)
      : false;

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Remove Friend',
        `Are you sure you want to remove ${friendName} from your friends?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeFriend(user.id, friendId);
                showToast('Friend removed');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to remove friend');
              }
            },
          },
        ]
      );
      return;
    }

    if (confirmed) {
      try {
        await removeFriend(user.id, friendId);
        showToast('Friend removed');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to remove friend');
      }
    }
  };

  const pendingRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.toUserId === user?.id
  );

  const sentRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.fromUserId === user?.id
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {user && (
          <View style={styles.profileSection}>
            {/* Profile Picture */}
            <View style={styles.avatarContainer}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Name and Email */}
            <Text style={styles.name}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            
            {/* Life Stats */}
            <View style={styles.lifeStats}>
              <Text style={styles.lifeStatsText}>
                {lifeStats.goalsCompleted} Goals Completed • {lifeStats.activeBuckets} Active Buckets • {lifeStats.friends} Friends
              </Text>
            </View>
            
            {/* Bio */}
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
          </View>
        )}

        {/* Friends Card */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setShowFriendsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>👥</Text>
              <Text style={styles.menuText}>Friends</Text>
              {friends.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{friends.length}</Text>
                </View>
              )}
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          {pendingRequests.length > 0 && (
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => setShowFriendsModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>🔔</Text>
                <Text style={styles.menuText}>Friend Requests</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Card */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>✏️</Text>
              <Text style={styles.menuText}>Edit Profile</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Settings' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('HelpSupport' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <Text style={styles.menuText}>Privacy Policy</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('TermsOfService' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuText}>Terms of Service</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity 
          style={styles.logOutButton} 
          onPress={() => {
            console.log('Logout button pressed!');
            handleSignOut();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Display Name *"
              placeholderTextColor="#999"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <TextInput
              style={styles.input}
              placeholder="Profile Picture URL (optional)"
              placeholderTextColor="#999"
              value={photoURL}
              onChangeText={setPhotoURL}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Bio (optional)"
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setDisplayName(user?.displayName || '');
                  setBio(user?.bio || '');
                  setPhotoURL(user?.photoURL || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Friends Modal */}
      <Modal
        visible={showFriendsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFriendsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Friends</Text>
              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={() => {
                  setShowFriendsModal(false);
                  setShowAddFriendModal(true);
                }}
              >
                <Text style={styles.addFriendButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                {pendingRequests.map((request) => {
                  const fromUser = pendingRequestUsers[request.id];
                  return (
                    <View key={request.id} style={styles.friendItem}>
                      <View style={styles.friendInfo}>
                        {fromUser?.photoURL ? (
                          <Image source={{ uri: fromUser.photoURL }} style={styles.friendAvatar} />
                        ) : (
                          <View style={styles.friendAvatarFallback}>
                            <Text style={styles.friendAvatarText}>
                              {fromUser?.displayName?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.friendDetails}>
                          <Text style={styles.friendName}>
                            {fromUser?.displayName || 'Loading...'}
                          </Text>
                          <Text style={styles.friendEmail}>{fromUser?.email || ''}</Text>
                        </View>
                      </View>
                      <View style={styles.friendActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => handleAcceptRequest(request.id)}
                        >
                          <Text style={styles.actionButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectRequest(request.id)}
                        >
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Friends List */}
            <ScrollView style={styles.friendsList}>
              {friends.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No friends yet</Text>
                  <Text style={styles.emptySubtext}>
                    Add friends to share buckets with them!
                  </Text>
                </View>
              ) : (
                friends.map((friend) => (
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
                      style={styles.removeButton}
                      onPress={() => handleRemoveFriend(friend.id, friend.displayName)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowFriendsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddFriendModal(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Friend</Text>

            <TextInput
              style={styles.input}
              placeholder="Search by name or email..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            {searching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6366F1" />
              </View>
            )}

            <ScrollView style={styles.searchResults}>
              {searchResults.map((result) => {
                const isFriend = friends.some(f => f.id === result.id);
                const hasPendingRequest = sentRequests.some(r => r.toUserId === result.id);
                
                return (
                  <View key={result.id} style={styles.searchResultItem}>
                    <View style={styles.friendInfo}>
                      {result.photoURL ? (
                        <Image source={{ uri: result.photoURL }} style={styles.friendAvatar} />
                      ) : (
                        <View style={styles.friendAvatarFallback}>
                          <Text style={styles.friendAvatarText}>
                            {result.displayName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.friendDetails}>
                        <Text style={styles.friendName}>{result.displayName}</Text>
                        <Text style={styles.friendEmail}>{result.email}</Text>
                      </View>
                    </View>
                    {isFriend ? (
                      <Text style={styles.statusText}>Friend</Text>
                    ) : hasPendingRequest ? (
                      <Text style={styles.statusText}>Request Sent</Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleSendFriendRequest(result.id)}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowAddFriendModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Toast 
        visible={toastVisible} 
        message={toastMessage} 
        onHide={() => setToastVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  lifeStats: {
    marginTop: 8,
    marginBottom: 16,
  },
  lifeStatsText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    textAlign: 'center',
  },
  bio: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 56,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: '300',
  },
  logOutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#111827',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addFriendButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  friendsList: {
    maxHeight: 400,
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
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  searchResults: {
    maxHeight: 300,
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
