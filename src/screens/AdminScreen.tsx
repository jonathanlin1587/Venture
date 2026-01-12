import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  getAllUsers,
  getAllBuckets,
  getAppStats,
  deleteBucketAdmin,
  updateUserAdminStatus,
} from '../services/adminService';
import { User, Bucket } from '../types';

export const AdminScreen: React.FC = () => {
  const { user, isAdmin: userIsAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'buckets'>('stats');
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalBuckets: number;
    totalGoals: number;
    completedGoals: number;
    activeUsers: number;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  useEffect(() => {
    if (!userIsAdmin) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      return;
    }
    loadData();
  }, [userIsAdmin, activeTab]);

  const loadData = async () => {
    if (!userIsAdmin) return;
    
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const appStats = await getAppStats();
        setStats(appStats);
      } else if (activeTab === 'users') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } else if (activeTab === 'buckets') {
        const allBuckets = await getAllBuckets();
        setBuckets(allBuckets);
      }
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBucket = async (bucketId: string, bucketName: string) => {
    const confirmMessage = Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm
      ? undefined
      : 'Are you sure you want to delete this bucket?';

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm(`Delete "${bucketName}"?`)) return;
    } else {
      // For native, we'll use Alert
      return; // Will implement with Alert below
    }

    try {
      await deleteBucketAdmin(bucketId);
      Alert.alert('Success', 'Bucket deleted successfully');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete bucket');
    }
  };

  const handleToggleAdmin = async (targetUserId: string, currentStatus: boolean) => {
    try {
      await updateUserAdminStatus(targetUserId, !currentStatus);
      Alert.alert('Success', `Admin status ${!currentStatus ? 'granted' : 'revoked'}`);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update admin status');
    }
  };

  if (!userIsAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedText}>🔒</Text>
          <Text style={styles.deniedTitle}>Access Denied</Text>
          <Text style={styles.deniedSubtitle}>You do not have admin privileges.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.displayName}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            📊 Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            👥 Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buckets' && styles.tabActive]}
          onPress={() => setActiveTab('buckets')}
        >
          <Text style={[styles.tabText, activeTab === 'buckets' && styles.tabTextActive]}>
            📦 Buckets
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'stats' && stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.activeUsers}</Text>
                  <Text style={styles.statLabel}>Active Users (30d)</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalBuckets}</Text>
                  <Text style={styles.statLabel}>Total Buckets</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalGoals}</Text>
                  <Text style={styles.statLabel}>Total Goals</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.completedGoals}</Text>
                  <Text style={styles.statLabel}>Completed Goals</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {stats.totalGoals > 0
                      ? Math.round((stats.completedGoals / stats.totalGoals) * 100)
                      : 0}%
                  </Text>
                  <Text style={styles.statLabel}>Completion Rate</Text>
                </View>
              </View>
            )}

            {activeTab === 'users' && (
              <View style={styles.listContainer}>
                {users.length === 0 ? (
                  <Text style={styles.emptyText}>No users found</Text>
                ) : (
                  users.map((u) => (
                    <View key={u.id} style={styles.listItem}>
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle}>{u.displayName}</Text>
                        <Text style={styles.listItemSubtitle}>{u.email}</Text>
                        <Text style={styles.listItemMeta}>
                          Joined: {u.createdAt.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.listItemActions}>
                        {u.id !== user?.id && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              u.isAdmin ? styles.actionButtonDanger : styles.actionButtonPrimary,
                            ]}
                            onPress={() => handleToggleAdmin(u.id, u.isAdmin || false)}
                          >
                            <Text style={styles.actionButtonText}>
                              {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {u.isAdmin && (
                          <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'buckets' && (
              <View style={styles.listContainer}>
                {buckets.length === 0 ? (
                  <Text style={styles.emptyText}>No buckets found</Text>
                ) : (
                  buckets.map((b) => (
                    <View key={b.id} style={styles.listItem}>
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle}>{b.name}</Text>
                        <Text style={styles.listItemSubtitle}>
                          Type: {b.type} • {b.members.length} member(s)
                        </Text>
                        <Text style={styles.listItemMeta}>
                          Created: {b.createdAt.toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonDanger]}
                        onPress={() => {
                          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
                            handleDeleteBucket(b.id, b.name);
                          } else {
                            Alert.alert(
                              'Delete Bucket',
                              `Are you sure you want to delete "${b.name}"?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () => handleDeleteBucket(b.id, b.name),
                                },
                              ]
                            );
                          }
                        }}
                      >
                        <Text style={styles.actionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deniedText: {
    fontSize: 64,
    marginBottom: 16,
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  deniedSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: '45%',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemContent: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  listItemMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonPrimary: {
    backgroundColor: '#6366F1',
  },
  actionButtonDanger: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 40,
  },
});
