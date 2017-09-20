import AbstractConnection from "./AbstractConnection";

const OPEN = Symbol("OPEN");
const DATA = Symbol("DATA");
const TIMEOUT = Symbol("TIMEOUT");
const ERROR = Symbol("ERROR");
const COMPLETE = Symbol("COMPLETE");
const ABORT = Symbol("ABORT");

export default class ConnectionEvent {
  /**
   * Connection event
   * @param {EventEmitter} target
   * @param {Symbol} type
   */
  constructor(target, type) {
    if (!(target instanceof AbstractConnection)) {
      throw new Error(
        `Invalid target, has to be an instance of Abstractconnection`
      );
    }

    if (![OPEN, DATA, TIMEOUT, ERROR, COMPLETE, ABORT].includes(type)) {
      throw new Error(
        `Invalid type "${type}", allowed types are OPEN, DATA, TIMEOUT, ERROR, COMPLETE, ABORT`
      );
    }

    /**
     * @property {EventEmitter}
     * @name ConnectionEvent#target
     */
    Object.defineProperty(this, "target", { value: target });

    /**
     * @property {Symbol}
     * @name ConnectionEvent#type
     */
    Object.defineProperty(this, "type", { value: type });
  }

  static get OPEN() {
    return OPEN;
  }

  static get DATA() {
    return DATA;
  }

  static get TIMEOUT() {
    return TIMEOUT;
  }

  static get ERROR() {
    return ERROR;
  }

  static get COMPLETE() {
    return COMPLETE;
  }

  static get ABORT() {
    return ABORT;
  }
}
