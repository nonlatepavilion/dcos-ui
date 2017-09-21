import { TestScheduler } from "rxjs";
import keepAlive from "../keepAlive";

describe("keepAlive", function() {
  it("retries on error", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    const input = scheduler.createColdObservable("-a-#");
    const expected = "-a--a-#";

    const backoffInterval = scheduler.createTime("---|");
    const withKeepalive = keepAlive(input, backoffInterval, 1, scheduler);

    scheduler.expectObservable(withKeepalive).toBe(expected);

    scheduler.flush();
  });

  it("retries on complete", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    const input = scheduler.createColdObservable("-a-|");
    const expected = "-a--a-|";

    const backoffInterval = scheduler.createTime("---|");
    const withKeepalive = keepAlive(input, backoffInterval, 1, scheduler);

    scheduler.expectObservable(withKeepalive).toBe(expected);

    scheduler.flush();
  });

  it("increases interval according to the linear backoff strategy", function() {
    const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    // prettier-ignore
    const input = scheduler.createColdObservable(
                        "-a-|");
    // prettier-ignore
    const subs =       ["^  !                         ",
    // prettier-ignore
                        "   ^  !                      ",
    // prettier-ignore
                        "       ^  !                  ",
    // prettier-ignore
                        "            ^  !             ",
    // prettier-ignore
                        "                  ^  !       ",
    // prettier-ignore
                        "                         ^  !"];
    // prettier-ignore
    const expected =    "-a--a---a----a-----a------a-|";

    const backoffInterval = scheduler.createTime("-|");
    const withKeepalive = keepAlive(input, backoffInterval, 5, scheduler);

    scheduler.expectSubscriptions(input.subscriptions).toBe(subs);
    scheduler.expectObservable(withKeepalive).toBe(expected);

    scheduler.flush();
  });
});
