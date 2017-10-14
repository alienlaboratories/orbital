//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

/**
 * Manages resize callbacks for registered elements.
 */
class ResizeManager {

  // Map of { size: { width, height }, handler } objects indexed by element.
  elementHandlers = new Map();

  constructor() {

    // Throttle event.
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize
    let running = false;
    window.addEventListener('resize', () => {
      if (!running) {
        running = true;
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('throttledResize'));
          running = false;
        });
      }
    });

    window.addEventListener('throttledResize', () => {
      this.elementHandlers.forEach((registration, element) => {
        let { size, handler } = registration;

        let newSize = {
          width: element.clientWidth,
          height: element.clientHeight
        };

        // Trigger if resized.
        if (newSize.width !== size.width || newSize.height !== size.height) {
          registration.size = newSize;
          handler(element, newSize);
        }
      });
    });
  }

  addHandler(element, handler) {
    console.assert(!this.elementHandlers.get(element));
    this.elementHandlers.set(element, {
      size: {
        width: element.clientWidth,
        height: element.clientHeight
      },
      handler
    });
  }

  removeHandler(element) {
    this.elementHandlers.remove(element);
  }
}

/**
 * DOM Utils.
 */
export class DomUtil {

  static resizeManager = new ResizeManager();

  static init() {
    console.log('INIT');
  }

  static getResizeManager() {
    return DomUtil.resizeManager;
  }

  /**
   * @param {[string]} ... variable length class names (which may be blank).
   * @returns {string} Space separated list of classnames.
   */
  static className() {
    return _.compact(arguments).join(' ');
  }
}
