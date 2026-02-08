type Task = () => Promise<void>;

export class ConcurrencyQueue {
  private queue: Task[] = [];
  private activeCount = 0;
  private concurrency: number;

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  /**
   * Adds a task to the queue and starts processing if concurrency allows.
   * This method returns immediately (does not await the task completion).
   */
  add(task: Task): void {
    this.queue.push(task);
    this.process();
  }

  private process(): void {
    // If we are at capacity or empty, stop
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;

    // Execute task without awaiting it here (fire and forget from caller's perspective,
    // but tracked by activeCount)
    task()
      .catch((err) => {
        console.error('Queue task error:', err);
      })
      .finally(() => {
        this.activeCount--;
        this.process();
      });

    // Try to process more if concurrency allows
    this.process();
  }

  /**
   * For testing/monitoring: returns pending count
   */
  get pendingCount(): number {
    return this.queue.length;
  }

  /**
   * For testing/monitoring: returns active count
   */
  get active(): number {
    return this.activeCount;
  }
}

// Global instance for notifications with concurrency of 10
// This limits concurrent outgoing requests to Telegram API
export const notificationQueue = new ConcurrencyQueue(10);
