import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Calendar({ tasks = [], onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getYear() + 1900;

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const hasTasks = tasks.some(task => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === date.toDateString();
    });
    
    calendarDays.push({
      day,
      date,
      isToday,
      isSelected,
      hasTasks,
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <View style={styles.viewButtons}>
            <TouchableOpacity 
              style={[styles.viewButton, currentView === 'week' && styles.viewButtonActive]}
              onPress={() => setCurrentView('week')}
            >
              <Text style={[styles.viewButtonText, currentView === 'week' && styles.viewButtonTextActive]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, currentView === 'month' && styles.viewButtonActive]}
              onPress={() => setCurrentView('month')}
            >
              <Text style={[styles.viewButtonText, currentView === 'month' && styles.viewButtonTextActive]}>Month</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesContainer}>
        {dayNames.map((dayName) => (
          <Text key={dayName} style={styles.dayName}>
            {dayName}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day?.isToday && styles.todayCell,
              day?.isSelected && styles.selectedCell,
            ]}
            onPress={() => day && onDateSelect(day.date)}
            disabled={!day}
          >
            {day && (
              <>
                <Text
                  style={[
                    styles.dayText,
                    day.isToday && styles.todayText,
                    day.isSelected && styles.selectedText,
                  ]}
                >
                  {day.day}
                </Text>
                {day.hasTasks && <View style={styles.taskIndicator} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.todayDot]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.taskDot]} />
          <Text style={styles.legendText}>Has Tasks</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#faf8f3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
  },
  monthContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewButtons: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#20B2AA',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  viewButtonTextActive: {
    color: '#ffffff',
  },
  todayButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  todayButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 80) / 7,
    height: (width - 80) / 7,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#20B2AA',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#e0f7f7',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  todayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#20B2AA',
    fontWeight: 'bold',
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  todayDot: {
    backgroundColor: '#20B2AA',
  },
  taskDot: {
    backgroundColor: '#f59e0b',
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
