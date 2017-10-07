//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

/**
 * Query manager.
 */
export class QueryManager {

  static init(ownProps, data) {
    let { queryId, queryManager } = ownProps;
    let { refetch } = data;
    queryManager && queryManager.registerQuery(queryId, refetch);
  }

  queryMap = new Map();

  refetch() {
    this.queryMap.forEach((refetch, queryId) => {
      refetch();
    });
  }

  registerQuery(queryId, refetch) {
    this.queryMap.set(queryId, refetch);
  }
}

/**
 * React utils.
 */
export class ReactUtil {

  /**
   * Default component properties.
   * @param props
   * @param defaults
   * @returns {{className: (string|_.LoDashExplicitWrapper<string>)}}
   */
  static defaultProps = (props, defaults={}) => {
    let { className } = props;

    return {
      className: _.compact([className, defaults.className]).join(' ') || undefined
    };
  };
}

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
}
