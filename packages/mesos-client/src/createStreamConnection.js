import Rx from "rxjs";
import { request } from "resource-service";
import keepAlive from "./rxjs-extensions/keepAlive";
import adaptiveTimeout from "./rxjs-extensions/adaptiveTimeout";

import extractRecords from "./recordio-extensions/extractRecords";

function getRecordsObservable(request) {
  return request
    .scan(extractRecords, {})
    .map(({ records }) => Rx.Observable.from(records))
    .concatAll();
}

export default function createStreamConnection(body, baseUrl = "") {
  const resource = request(`${baseUrl}/mesos/api/v1`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  const records = getRecordsObservable(resource);
  const withTimeout = adaptiveTimeout(records);

  return keepAlive(withTimeout);
}
