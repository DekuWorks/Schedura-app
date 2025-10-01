import { describe, it, expect } from 'vitest'
import { createScheduler, type Task, type BusyBlock, type Constraint } from '../src/engine'

describe('SchedulerEngine', () => {
  const timezone = 'America/New_York'
  const scheduler = createScheduler(timezone)

  const baseConstraint: Constraint = {
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    timezone,
    max_daily_hours: 8
  }

  it('should schedule a simple task', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Meeting',
        duration: 60,
        priority: 'high'
      }
    ]

    const busyBlocks: BusyBlock[] = []
    const slots = scheduler.scheduleTasks(tasks, busyBlocks, baseConstraint)

    expect(slots).toHaveLength(1)
    expect(slots[0].task_id).toBe('1')
    expect(slots[0].confidence).toBeGreaterThan(0)
  })

  it('should handle busy blocks', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        duration: 60,
        priority: 'high'
      },
      {
        id: '2',
        title: 'Task 2',
        duration: 30,
        priority: 'medium'
      }
    ]

    const busyBlocks: BusyBlock[] = [
      {
        start: '2024-01-01T10:00:00Z',
        end: '2024-01-01T11:00:00Z',
        title: 'Existing meeting'
      }
    ]

    const slots = scheduler.scheduleTasks(tasks, busyBlocks, baseConstraint)

    expect(slots).toHaveLength(2)
    
    // Check that slots don't overlap with busy blocks
    for (const slot of slots) {
      const slotStart = new Date(slot.start)
      const slotEnd = new Date(slot.end)
      const busyStart = new Date(busyBlocks[0].start)
      const busyEnd = new Date(busyBlocks[0].end)
      
      const overlaps = (slotStart < busyEnd && slotEnd > busyStart)
      expect(overlaps).toBe(false)
    }
  })

  it('should prioritize high priority tasks', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Low priority task',
        duration: 60,
        priority: 'low'
      },
      {
        id: '2',
        title: 'High priority task',
        duration: 30,
        priority: 'high'
      }
    ]

    const busyBlocks: BusyBlock[] = []
    const slots = scheduler.scheduleTasks(tasks, busyBlocks, baseConstraint)

    expect(slots).toHaveLength(2)
    
    // High priority task should be scheduled first (earlier in the day)
    const highPrioritySlot = slots.find(s => s.task_id === '2')
    const lowPrioritySlot = slots.find(s => s.task_id === '1')
    
    expect(highPrioritySlot).toBeDefined()
    expect(lowPrioritySlot).toBeDefined()
    expect(new Date(highPrioritySlot!.start)).toBeLessThan(new Date(lowPrioritySlot!.start))
  })

  it('should respect earliest start constraint', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Afternoon task',
        duration: 60,
        priority: 'high',
        earliest_start: '2024-01-01T14:00:00Z'
      }
    ]

    const busyBlocks: BusyBlock[] = []
    const slots = scheduler.scheduleTasks(tasks, busyBlocks, baseConstraint)

    expect(slots).toHaveLength(1)
    expect(new Date(slots[0].start)).toBeGreaterThanOrEqual(new Date('2024-01-01T14:00:00Z'))
  })

  it('should handle insufficient time gracefully', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Long task',
        duration: 600, // 10 hours
        priority: 'high'
      }
    ]

    const busyBlocks: BusyBlock[] = [
      {
        start: '2024-01-01T09:00:00Z',
        end: '2024-01-01T16:00:00Z', // 7 hours busy
        title: 'Long meeting'
      }
    ]

    const slots = scheduler.scheduleTasks(tasks, busyBlocks, baseConstraint)

    // Should not schedule if insufficient time
    expect(slots).toHaveLength(0)
  })
})
