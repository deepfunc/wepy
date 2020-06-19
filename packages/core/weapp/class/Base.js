import { isArr, isStr, isObj, handleError } from '../util/index';
import { set, del } from '../observer/index';

export default class Base {
  constructor() {
    this._events = {};
    this._watchers = [];
  }

  $set(target, key, val) {
    return set(this, target, key, val);
  }

  $delete(target, key) {
    return del(target, key);
  }

  $on(event, fn) {
    if (isArr(event)) {
      event.forEach(item => {
        if (isStr(item)) {
          this.$on(item, fn);
        } else if (isObj(item)) {
          this.$on(item.event, item.fn);
        }
      });
    } else {
      (this._events[event] || (this._events[event] = [])).push(fn);
    }
    return this;
  }

  $once() {}

  $off(event, fn) {
    if (!event && !fn) {
      this._events = Object.create(null);
      return this;
    }

    if (isArr(event)) {
      event.forEach(item => {
        if (isStr(item)) {
          this.$off(item, fn);
        } else if (isObj(item)) {
          this.$off(item.event, item.fn);
        }
      });
      return this;
    }
    if (!this._events[event]) return this;

    if (!fn) {
      this._events[event] = null;
      return this;
    }

    if (fn) {
      let fns = this._events[event];
      this._events[event] = fns.filter(f => f !== fn);
    }
    return this;
  }

  $emit(event, ...args) {
    let vm = this;
    let lowerCaseEvent = event.toLowerCase();
    let fns = this._events[event] || [];
    if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
      // TODO: handler warn
    }
    fns.forEach(fn => {
      try {
        fn.apply(this, args);
      } catch (e) {
        handleError(e, vm, `event handler for "${event}"`);
      }
    });
    return this;
  }
}
