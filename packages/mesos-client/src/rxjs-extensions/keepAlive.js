import { Subscriber, Scheduler } from "rxjs";

export default function keepAlive(
  source,
  backoffInterval = 5000,
  maxRetries = -1,
  scheduler = Scheduler.async
) {
  return source.lift(
    new KeepAliveOperator(source, backoffInterval, maxRetries, scheduler)
  );
}

class KeepAliveOperator {
  constructor(source, backoffInterval, maxRetries, scheduler) {
    this.source = source;
    this.maxRetries = maxRetries;
    this.backoffInterval = backoffInterval;
    this.scheduler = scheduler;
  }

  call(subscriber, source) {
    return source.subscribe(
      new KeepAliveSubscriber(
        subscriber,
        this.backoffInterval,
        this.maxRetries,
        this.source,
        this.scheduler
      )
    );
  }
}

class KeepAliveSubscriber extends Subscriber {
  constructor(destination, backoffInterval, maxRetries, source, scheduler) {
    super(destination);

    this.source = source;
    this.scheduler = scheduler;

    this.retryAttempt = 0;
    this.backoffInterval = backoffInterval;
    this.maxRetries = maxRetries;
  }

  error(error) {
    if (!this.isStopped) {
      this.isStopped = false;
      this.closed = false;

      if (this._shouldRetry()) {
        this.scheduleResubscribe();
      } else {
        this.unsubscribe();
        this.destination.error(error);
      }
    }
  }

  complete() {
    if (!this.isStopped) {
      this.isStopped = false;
      this.closed = false;

      if (this._shouldRetry()) {
        this.scheduleResubscribe();
      } else {
        this.unsubscribe();
        this.destination.complete();
      }
    }
  }

  static dispatchTimeout(subscriber) {
    // subscriber._unsubscribeAndRecycle();
    subscriber.source.subscribe(subscriber);
  }

  scheduleResubscribe() {
    const { action } = this;

    if (action) {
      // Recycle the action if we've already scheduled one. All the production
      // Scheduler Actions mutate their state/delay time and return themeselves.
      // VirtualActions are immutable, so they create and return a clone. In this
      // case, we need to set the action reference to the most recent VirtualAction,
      // to ensure that's the one we clone from next time.
      this.action = action.schedule(
        this,
        this.retryAttempt * this.backoffInterval
      );
    } else {
      this.action = this.scheduler.schedule(
        KeepAliveSubscriber.dispatchTimeout,
        this.retryAttempt * this.backoffInterval,
        this
      );

      this.add(this.action);
    }

    this.retryAttempt++;
  }

  // _unsubscribe() {}

  _shouldRetry() {
    return this.maxRetries > -1 && this.maxRetries > this.retryAttempt;
  }
}
