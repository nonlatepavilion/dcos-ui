import { Subscriber, Scheduler, TimeoutError } from "rxjs";

// As Mesos documentation suggests, to make sure the connection is dead
// we should wait for "an extended period of time" e.g., 5 x heartbeat_interval_seconds
export const TIMEOUT_FACTOR = 5;
const DEFAULT_TIMEOUT = 5000;

export default function adaptiveTimeout(
  source,
  initialTimeout,
  scheduler = Scheduler.async
) {
  return source.lift(
    new AdaptiveTimeoutOperator(scheduler, initialTimeout, new TimeoutError())
  );
}

class AdaptiveTimeoutOperator {
  constructor(scheduler, initialTimeout, errorInstance) {
    this.scheduler = scheduler;
    this.initialTimeout = initialTimeout;
    this.errorInstance = errorInstance;
  }

  call(subscriber, source) {
    return source.subscribe(
      new AdaptiveTimeoutSubscriber(
        subscriber,
        this.initialTimeout,
        this.scheduler,
        this.errorInstance
      )
    );
  }
}

class AdaptiveTimeoutSubscriber extends Subscriber {
  constructor(destination, initialTimeout, scheduler, errorInstance) {
    super(destination);

    this.scheduler = scheduler;
    this.errorInstance = errorInstance;

    this.heartbeatInterval = initialTimeout || DEFAULT_TIMEOUT;

    this.scheduleTimeout();
  }

  static dispatchTimeout(subscriber) {
    subscriber.error(subscriber.errorInstance);
  }

  scheduleTimeout() {
    const { action } = this;
    if (action) {
      // Recycle the action if we've already scheduled one. All the production
      // Scheduler Actions mutate their state/delay time and return themeselves.
      // VirtualActions are immutable, so they create and return a clone. In this
      // case, we need to set the action reference to the most recent VirtualAction,
      // to ensure that's the one we clone from next time.
      this.action = action.schedule(this, this.heartbeatInterval);
    } else {
      this.add(
        (this.action = this.scheduler.schedule(
          AdaptiveTimeoutSubscriber.dispatchTimeout,
          this.heartbeatInterval,
          this
        ))
      );
    }
  }

  _next(value) {
    if (value && value.type === "SUBSCRIBED") {
      this.heartbeatInterval =
        value.subscribed.heartbeat_interval_seconds * 1000 * TIMEOUT_FACTOR;
    }

    this.scheduleTimeout();

    super._next(value);
  }

  _unsubscribe() {
    this.action = null;
    this.scheduler = null;
    this.errorInstance = null;
  }
}
