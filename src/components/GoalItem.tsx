import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { Goal, GOAL_CATEGORIES } from '../types';

interface GoalItemProps {
  goal: Goal;
  onToggle: () => void;
  onFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  onUpdateMemory?: (journal: string) => void;
}

export const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  onToggle,
  onFavorite,
  onEdit,
  onDelete,
  onPress,
  onUpdateMemory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [journalText, setJournalText] = useState(goal.memoryJournal || '');

  const categories = goal.categories 
    ? goal.categories.map(catId => GOAL_CATEGORIES.find(c => c.id === catId)).filter(Boolean)
    : [];

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const due = new Date(date);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return due.toLocaleDateString();
    }
  };

  const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && !goal.completed;

  const handleJournalChange = (text: string) => {
    setJournalText(text);
    if (onUpdateMemory) {
      onUpdateMemory(text);
    }
  };

  const hasMemory = goal.completed && (goal.completionPhotos?.length > 0 || goal.memoryJournal);

  return (
    <View
      style={[
        styles.container,
        goal.completed && styles.completedContainer,
        isOverdue && styles.overdueContainer,
      ]}
    >
      <View style={styles.contentWrapper}>
        <TouchableOpacity
          style={[styles.checkbox, goal.completed && styles.checkboxChecked]}
          onPress={onToggle}
        >
          {goal.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={goal.completed ? () => setIsExpanded(!isExpanded) : (onEdit || onPress)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.title, goal.completed && styles.completedTitle]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {goal.title}
            </Text>
            {categories.length > 0 && (
              <View style={styles.categoriesRow}>
                {categories.map((category) => category && (
                  <View key={category.id} style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
                  </View>
                ))}
              </View>
            )}
            {goal.description && (
              <Text
                style={[styles.description, goal.completed && styles.completedDescription]}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {goal.description}
              </Text>
            )}
            <View style={styles.metaRow}>
              {goal.dueDate && !goal.completed && (
                <Text style={[styles.dueDate, isOverdue && styles.overdueDate]}>
                  📅 {formatDueDate(goal.dueDate)}
                </Text>
              )}
              {goal.completedAt && (
                <Text style={styles.completedDate}>
                  ✓ Completed {goal.completedAt.toLocaleDateString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Memory Section - Expandable for completed goals */}
          {goal.completed && (
            <View style={styles.memorySection}>
              {hasMemory && (
                <TouchableOpacity
                  onPress={() => setIsExpanded(!isExpanded)}
                  style={styles.memoryToggle}
                >
                  <Text style={styles.memoryToggleText}>
                    {isExpanded ? '▼ Hide Memory' : '▶ View Memory'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {isExpanded && (
                <View style={styles.memoryContent}>
                  {/* Photos */}
                  {goal.completionPhotos && goal.completionPhotos.length > 0 && (
                    <View style={styles.photosContainer}>
                      {goal.completionPhotos.map((photoUrl, index) => (
                        <Image
                          key={index}
                          source={{ uri: photoUrl }}
                          style={styles.memoryPhoto}
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  )}
                  
                  {/* Journal Entry */}
                  <View style={styles.journalContainer}>
                    <Text style={styles.journalLabel}>Memory Journal</Text>
                    {onUpdateMemory ? (
                      <TextInput
                        style={styles.journalInput}
                        placeholder="Write about this achievement..."
                        value={journalText}
                        onChangeText={handleJournalChange}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="#999"
                      />
                    ) : (
                      <Text style={styles.journalText}>
                        {goal.memoryJournal || 'No journal entry yet. Tap edit to add one.'}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        <View style={styles.actionsContainer}>
          {onFavorite && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionIcon}>
                {goal.isFavorite ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('Delete goal button pressed');
                onDelete();
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  contentWrapper: {
    flexDirection: 'row',
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
  },
  completedContainer: {
    backgroundColor: '#fafafa',
  },
  overdueContainer: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    marginTop: 2,
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    lineHeight: 22,
  },
  completedTitle: {
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginLeft: 8,
    paddingTop: 2,
  },
  actionButton: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 18,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  completedDescription: {
    color: '#999',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  overdueDate: {
    color: '#ff3b30',
    fontWeight: '600',
  },
  completedDate: {
    fontSize: 12,
    color: '#999',
  },
  memorySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  memoryToggle: {
    paddingVertical: 8,
  },
  memoryToggleText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  memoryContent: {
    marginTop: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  memoryPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  journalContainer: {
    marginTop: 8,
  },
  journalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  journalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fafafa',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  journalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
