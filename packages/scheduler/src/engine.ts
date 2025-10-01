import { addMinutes, isAfter, isBefore, parseISO, format } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

export interface Task {
  id: string
  title: string
  duration: number // in minutes
  priority: 'low' | 'medium' | 'high'
  earliest_start?: string // ISO string
  latest_start?: string // ISO string
  category?: string
  travel_buffer?: number // in minutes
}

export interface BusyBlock {
  start: string // ISO string
  end: string // ISO string
  title?: string
}

export interface Constraint {
  working_hours_start: string // HH:mm format
  working_hours_end: string // HH:mm format
  timezone: string
  max_daily_hours?: number
  preferred_break_duration?: number // in minutes
}

export interface ProposedSlot {
  task_id: string
  start: string // ISO string
  end: string // ISO string
  confidence: number // 0-1
  conflicts: string[] // IDs of conflicting tasks
}

export class SchedulerEngine {
  private timezone: string

  constructor(timezone: string = 'UTC') {
    this.timezone = timezone
  }

  /**
   * Schedule tasks into available time slots
   */
  scheduleTasks(
    tasks: Task[],
    busyBlocks: BusyBlock[],
    constraints: Constraint
  ): ProposedSlot[] {
    const slots: ProposedSlot[] = []
    const sortedTasks = this.sortTasksByPriority(tasks)
    
    // Convert to timezone-aware dates
    const busyBlocksInTz = busyBlocks.map(block => ({
      start: utcToZonedTime(parseISO(block.start), this.timezone),
      end: utcToZonedTime(parseISO(block.end), this.timezone),
      title: block.title
    }))

    for (const task of sortedTasks) {
      const slot = this.findBestSlot(task, busyBlocksInTz, constraints, slots)
      if (slot) {
        slots.push(slot)
      }
    }

    return slots
  }

  private sortTasksByPriority(tasks: Task[]): Task[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // If same priority, sort by duration (shorter first for flexibility)
      return a.duration - b.duration
    })
  }

  private findBestSlot(
    task: Task,
    busyBlocks: Array<{ start: Date; end: Date; title?: string }>,
    constraints: Constraint,
    existingSlots: ProposedSlot[]
  ): ProposedSlot | null {
    const today = new Date()
    const workingDays = 7 // Look ahead 7 days
    
    for (let dayOffset = 0; dayOffset < workingDays; dayOffset++) {
      const currentDay = addMinutes(today, dayOffset * 24 * 60)
      const dayStart = this.getDayStart(currentDay, constraints)
      const dayEnd = this.getDayEnd(currentDay, constraints)
      
      const availableSlots = this.findAvailableSlots(
        dayStart,
        dayEnd,
        busyBlocks,
        existingSlots,
        task.duration + (task.travel_buffer || 0)
      )
      
      for (const slot of availableSlots) {
        if (this.isValidSlot(task, slot, constraints)) {
          return {
            task_id: task.id,
            start: zonedTimeToUtc(slot.start, this.timezone).toISOString(),
            end: zonedTimeToUtc(slot.end, this.timezone).toISOString(),
            confidence: this.calculateConfidence(task, slot, constraints),
            conflicts: []
          }
        }
      }
    }
    
    return null
  }

  private getDayStart(date: Date, constraints: Constraint): Date {
    const [hours, minutes] = constraints.working_hours_start.split(':').map(Number)
    const dayStart = new Date(date)
    dayStart.setHours(hours, minutes, 0, 0)
    return utcToZonedTime(dayStart, this.timezone)
  }

  private getDayEnd(date: Date, constraints: Constraint): Date {
    const [hours, minutes] = constraints.working_hours_end.split(':').map(Number)
    const dayEnd = new Date(date)
    dayEnd.setHours(hours, minutes, 0, 0)
    return utcToZonedTime(dayEnd, this.timezone)
  }

  private findAvailableSlots(
    dayStart: Date,
    dayEnd: Date,
    busyBlocks: Array<{ start: Date; end: Date; title?: string }>,
    existingSlots: ProposedSlot[],
    requiredDuration: number
  ): Array<{ start: Date; end: Date }> {
    const slots: Array<{ start: Date; end: Date }> = []
    const allBusyTimes = [...busyBlocks, ...this.convertSlotsToBusyBlocks(existingSlots)]
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    let currentTime = new Date(dayStart)
    
    for (const busyBlock of allBusyTimes) {
      if (isAfter(busyBlock.start, dayEnd)) break
      
      if (isAfter(currentTime, busyBlock.end)) continue
      
      if (isBefore(busyBlock.start, dayEnd) && isAfter(busyBlock.end, currentTime)) {
        const slotEnd = isBefore(busyBlock.start, dayEnd) ? busyBlock.start : dayEnd
        const slotDuration = slotEnd.getTime() - currentTime.getTime()
        
        if (slotDuration >= requiredDuration * 60 * 1000) {
          slots.push({
            start: new Date(currentTime),
            end: new Date(slotEnd)
          })
        }
        
        currentTime = new Date(busyBlock.end)
      }
    }
    
    // Check for slot after last busy block
    if (isBefore(currentTime, dayEnd)) {
      const slotDuration = dayEnd.getTime() - currentTime.getTime()
      if (slotDuration >= requiredDuration * 60 * 1000) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(dayEnd)
        })
      }
    }
    
    return slots
  }

  private convertSlotsToBusyBlocks(slots: ProposedSlot[]): Array<{ start: Date; end: Date; title?: string }> {
    return slots.map(slot => ({
      start: utcToZonedTime(parseISO(slot.start), this.timezone),
      end: utcToZonedTime(parseISO(slot.end), this.timezone)
    }))
  }

  private isValidSlot(task: Task, slot: { start: Date; end: Date }, constraints: Constraint): boolean {
    // Check earliest start constraint
    if (task.earliest_start) {
      const earliestStart = utcToZonedTime(parseISO(task.earliest_start), this.timezone)
      if (isBefore(slot.start, earliestStart)) return false
    }
    
    // Check latest start constraint
    if (task.latest_start) {
      const latestStart = utcToZonedTime(parseISO(task.latest_start), this.timezone)
      if (isAfter(slot.start, latestStart)) return false
    }
    
    return true
  }

  private calculateConfidence(
    task: Task,
    slot: { start: Date; end: Date },
    constraints: Constraint
  ): number {
    let confidence = 1.0
    
    // Reduce confidence for tasks scheduled near end of day
    const dayEnd = this.getDayEnd(slot.start, constraints)
    const timeUntilDayEnd = dayEnd.getTime() - slot.start.getTime()
    const hoursUntilEnd = timeUntilDayEnd / (1000 * 60 * 60)
    
    if (hoursUntilEnd < 2) {
      confidence *= 0.8
    }
    
    // Reduce confidence for high priority tasks scheduled late
    if (task.priority === 'high' && hoursUntilEnd < 4) {
      confidence *= 0.9
    }
    
    return Math.max(0, Math.min(1, confidence))
  }
}

export function createScheduler(timezone: string = 'UTC'): SchedulerEngine {
  return new SchedulerEngine(timezone)
}
