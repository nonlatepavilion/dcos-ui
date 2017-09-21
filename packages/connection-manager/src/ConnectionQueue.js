import { List } from "immutable";
import ConnectionQueueItem from "./ConnectionQueueItem";

/**
 * Connection Queue
 *
 * The queue is prioritized to enable dynamic connection handling and
 * best utilize the bandwidth available.
 *
 * This impl. wraps `Immutable.List` instead of extending `List` due to
 * https://github.com/facebook/immutable-js/issues/301
 */
export default class ConnectionQueue {
  /**
   * Initializes an instance of ConnectionQueue
   * @param {Set} connections – list of connections
   */
  constructor(connections = List()) {
    if (!List.isList(connections)) {
      throw new Error(
        "Given list of connection must to be an instance of List."
      );
    }

    /**
     * @property {List}
     * @name ConnectionQueue#connections
     */
    Object.defineProperty(this, "connections", { value: connections });
  }

  /**
   * Return current size of queue
   * @return {int} size of queue
   */
  get size() {
    return this.connections.size;
  }

  /**
   * returns the first connection
   * @return {AbstractConnection} - first connection
   */
  first() {
    if (this.connections.first() === undefined) {
      throw new Error("Cant get first() from empty Queue");
    }

    return this.connections.first().connection;
  }

  /**
   * returns a new queue without the first connection
   * @return {ConnectionQueue} – ConnectionQueue without first connection
   */
  shift() {
    if (this.connections.first() === undefined) {
      throw new Error("Cant shift() on empty Queue");
    }

    return new ConnectionQueue(this.connections.shift());
  }

  /**
   * Adds given connection with given (or default) priority to queue
   * @param {AbstractConnection} connection – Connection to be added to queue
   * @param {Integer} priority – priority of connection
   * @return {ConnectionQueue} - ConnectionQueue containing the added connection
   */
  enqueue(connection, priority) {
    if (this.includes(connection)) {
      throw new Error(`Cant enqueue already queued connection.`);
    }

    return new ConnectionQueue(
      this.connections
        .push(new ConnectionQueueItem(connection, priority))
        .sort(({ priority: a }, { priority: b }) => {
          if (a > b) {
            return -1;
          }

          if (a < b) {
            return 1;
          }

          return 0;
        })
    );
  }

  /**
   * removes a connection from queue
   * @param {AbstractConnection} connection – connection to be deleted
   * @return {ConnectionQueue} - ConnectionQueue without the resp. connection
   */
  dequeue(connection) {
    if (!this.includes(connection)) {
      throw new Error(`Cant dequeue unknown connection.`);
    }

    const item = new ConnectionQueueItem(connection);

    return new ConnectionQueue(this.connections.filter(v => !v.equals(item)));
  }

  includes(connection) {
    const item = new ConnectionQueueItem(connection);

    return this.connections.some(v => v.equals(item));
  }
}
