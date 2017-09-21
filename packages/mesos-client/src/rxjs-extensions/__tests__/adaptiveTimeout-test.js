import { TestScheduler, TimeoutError } from "rxjs";
import adaptiveTimeout, { TIMEOUT_FACTOR } from "../adaptiveTimeout";

describe("adaptiveTimeout", function() {
  it("timeouts according to the initialTimeout", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    const input = scheduler.createColdObservable("-------------------a");
    const initialTimeout = scheduler.createTime("---|");
    const expected = "---#";

    const withAdaptiveTimeout = adaptiveTimeout(
      input,
      initialTimeout,
      scheduler
    );

    scheduler
      .expectObservable(withAdaptiveTimeout)
      .toBe(expected, {}, new TimeoutError());

    scheduler.flush();
  });

  it("doesn't timeout when there are values on the wire", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    const input = scheduler.createColdObservable("-a-|");
    const initialTimeout = scheduler.createTime("----|");
    const expected = "-a-|";

    const withAdaptiveTimeout = adaptiveTimeout(
      input,
      initialTimeout,
      scheduler
    );

    scheduler.expectObservable(withAdaptiveTimeout).toBe(expected);

    scheduler.flush();
  });

  it("doesn't timeout when values are keep comming", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    const input = scheduler.createColdObservable("-a-a-a-a-|");
    const initialTimeout = scheduler.createTime("--|");
    const expected = "-a-a-a-a-|";

    const withAdaptiveTimeout = adaptiveTimeout(
      input,
      initialTimeout,
      scheduler
    );

    scheduler.expectObservable(withAdaptiveTimeout).toBe(expected);

    scheduler.flush();
  });

  it("adjusts timeout according to the first value", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    const initialTimeout = scheduler.createTime("----|");
    const adjustedTimeout = scheduler.createTime("--|");
    const values = {
      a: {
        type: "SUBSCRIBED",
        subscribed: {
          // Because of the way Rx offers to test stuff with the createTime
          // which maps the marble notation to _a_ number
          // we need to compensate for the seconds -> miliseconds
          // conversion and the timeout factor so our test in control of time
          heartbeat_interval_seconds: adjustedTimeout / (1000 * TIMEOUT_FACTOR)
        }
      }
    };
    const input = scheduler.createColdObservable("-a----b-|", values);
    const expected = "-a-#";

    const withAdaptiveTimeout = adaptiveTimeout(
      input,
      initialTimeout,
      scheduler
    );

    scheduler
      .expectObservable(withAdaptiveTimeout)
      .toBe(expected, values, new TimeoutError());

    scheduler.flush();
  });
});
