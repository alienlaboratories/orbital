//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import moment from 'moment';

import { ErrorUtil, Logger, TypeUtil } from 'orbital-util';

const logger = Logger.get('matcher');

const LABEL = {
  DELETED: '_deleted'
};

/**
 * Item matcher.
 *
 * The matcher is used by both client and server to determine if items match a given filter.
 * Filters are used to screen collections of items, which may be leaf nodes (arrays) of a GraphQL query.
 */
export class Matcher {

  /**
   * Matches the items against the filter.
   *
   * @param context
   * @param root
   * @param filter
   * @param items
   * @returns {[item]} Array of items that match.
   */
  matchItems(context, root, filter, items) {
    return _.filter(items, item => this.matchItem(context, root, filter, item));
  }

  /**
   * Matches the item against the filter.
   *
   * @param context
   * @param root
   * @param filter
   * @param item
   * @returns {boolean} True if the item matches the filter.
   */
  matchItem(context, root, filter, item) {
    console.assert(item && filter);
//  console.log('MATCH: [%s]: %s', JSON.stringify(filter), JSON.stringify(item));

    // TODO(burdon): Filter should not include bucket (implicit in query)?
    if (filter.bucket && filter.bucket !== item.bucket) {
      return false;
    }

    // Bucket match (ACL filtering).
    if (item.bucket && _.indexOf(_.get(context, 'buckets'), item.bucket) === -1) {
      return false;
    }

    // Matches given IDs.
    // TODO(burdon): Keys?
    if (filter.ids && _.indexOf(filter.ids, item.key.id) !== -1) {
      return true;
    }

    // Matches given foreign keys.
    if (filter.fkeys && _.indexOf(filter.fkeys, item.fkey) !== -1) {
      return true;
    }

    // Must match something.
    // TODO(burdon): Need to provide namespace (i.e., 'User' can't be used to fan-out to firebase).
    if (!filter || !filter.matchAll && TypeUtil.isEmpty(
      _.pick(filter, ['type', 'labels', 'text', 'expr']))) {
      return false;
    }

    // Type match.
    if (filter.type && _.toLower(filter.type) !== _.toLower(item.type)) {
      return false;
    }

    // Deleted.
    // TODO(burdon): Intersection.
    if (_.indexOf(item.labels, LABEL.DELETED) !== -1 &&
        _.indexOf(filter.labels, LABEL.DELETED) === -1) {
      return false;
    }

    // Label match.
    if (!this.matchLabels(filter.labels, item)) {
      return false;
    }

    // Expression match.
    // TODO(burdon): Handle AST.
    if (filter.expr) {
      if (!Matcher.matchRootExpression(context, root, filter.expr, item)) {
        return false;
      }
    }

    // Text match.
    let text = _.lowerCase(filter.text);
    if (text && _.lowerCase(item.title).indexOf(text) === -1) {
      return false;
    }

    return true;
  }

  matchLabels(labels, item) {
    let posLabels = _.filter(labels, label => !_.startsWith(label, '!'));
    if (!_.isEmpty(posLabels) && _.intersection(posLabels, item.labels).length === 0) {
      return false;
    }

    // TODO(madadam): Use predicate tree for negative matching instead of this way to negate labels?
    let negLabels = _.map(_.filter(labels, label => _.startsWith(label, '!')), label => label.substring(1));
    if (!_.isEmpty(negLabels) && _.intersection(negLabels, item.labels).length > 0) {
      return false;
    }

    return true;
  }

  static matchRootExpression(context, root, expr, item) {
    try {
      return Matcher.matchExpression(context, root, expr, item);
    } catch(error) {
      logger.error(ErrorUtil.message(error));
      return false;
    }
  }

  /**
   * Recursively match the expression tree.
   *
   * @param context
   * @param root
   * @param expr
   * @param item
   * @returns {boolean}
   */
  static matchExpression(context, root, expr, item) {
    if (expr.op) {
      return Matcher.matchBooleanExpression(context, root, expr, item);
    }

    // The comparator may be implicit (i.e., EQ).
    if (expr.comp || expr.field) {
      return Matcher.matchComparatorExpression(context, root, expr, item);
    }

    throw 'Invalid expression: ' + JSON.stringify(expr);
  }

  /**
   * Recursively match boolean expressions.
   *
   * @param context
   * @param root
   * @param expr
   * @param item
   * @returns {boolean}
   */
  static matchBooleanExpression(context, root, expr, item) {
    console.assert(expr.op);

    let match = false;
    switch (expr.op) {

      case 'OR': {
        _.each(expr.expr, expr => {
          if (Matcher.matchExpression(context, root, expr, item)) {
            match = true;
            return false;
          }
        });

        return match;
      }

      case 'AND': {
        match = true;

        _.each(expr.expr, expr => {
          if (!Matcher.matchExpression(context, root, expr, item)) {
            match = false;
            return false;
          }
        });

        return match;
      }

      default: {
        throw 'Invalid operator: ' + JSON.stringify(expr);
      }
    }
  }

  /**
   * Match comparator expressions.
   *
   * @param context
   * @param root
   * @param expr
   * @param item
   * @returns {boolean}
   */
  static matchComparatorExpression(context, root, expr, item) {
    console.assert(expr.field);

    // Value to match.
    let inputValue = expr.value;

    // Value of field within item.
    // TODO(burdon): This is different client and server!
    // (e.g., on server "assignee" is an ID; on the client, it's an object).
    let fieldValue = _.get(item, expr.field);

    //
    // Substitute value for reference.
    //
    let ref = expr.ref;
    if (ref) {
      // Resolve magic variables against context (e.g., $CONTEXT.userId).
      let match = ref.match(/\$CONTEXT\.(.+)/);
      if (match) {
        let value = _.get(context, match[1]);
        console.assert(value, 'Invalid context: ' + JSON.stringify({ context, ref }));
        inputValue = { id: value };
      } else {
        // TODO(burdon): Resolve other scalar types.
        // TODO(burdon): Use the resolver's info attribute to enable to ref to reference ancestor nodes?
        let value = _.get(root, ref);
        if (value) {
          inputValue = { id: value };
        }
      }
    }

    //
    // Special values.
    //

    // TODO(burdon): This should not mutate the filter. Copy instead.
    // Relative timestamp.
    if (inputValue.timestamp) {
      if (inputValue.timestamp <= 0) {
        inputValue.timestamp = moment().subtract(-inputValue.timestamp, 'ms').valueOf();
      }
    }

    //
    // Scalar values.
    // TODO(burdon): Unit tests.
    //

    let eq = false;
    let not = false;
    //noinspection FallThroughInSwitchStatementJS
    switch (expr.comp) {

      case 'IN':
        return Matcher.isIn(fieldValue, inputValue, not);

      case 'GTE':
        eq = true;
        // falls through.
      case 'GT':
        return Matcher.isGreaterThan(fieldValue, inputValue, eq);

      case 'LTE':
        eq = true;
        // falls through.
      case 'LT':
        return Matcher.isLessThan(fieldValue, inputValue, eq);

      case 'NE':
        not = true;
        // falls through.
      case 'EQ':
        // falls through.
      default:
        return Matcher.isEqualTo(fieldValue, inputValue, not);
    }
  }

  // NOTE: See ValueInput in schema.
  static SCALARS = ['id', 'timestamp', 'date', 'int', 'float', 'string', 'boolean'];

  static scalarValue(inputValue) {
    let value = undefined;
    _.each(Matcher.SCALARS, field => {
      if (inputValue[field] !== undefined) {
        value = inputValue[field];
        return false;
      }
    });

    return value;
  }

  static isIn(fieldValue, inputValue, not) {
    return (_.indexOf(fieldValue, Matcher.scalarValue(inputValue)) === -1) ? not : !not;
  }

  static isEqualTo(fieldValue, inputValue, not) {

    // Check null.
    // NOTE: Double equals matches null and undefined.
    if (inputValue.null === true) {
      // TODO(burdon): Check how "null" is actually stored (unlike undefined).
      return fieldValue === null;
    }

    let match = false;
    _.each(Matcher.SCALARS, field => {
      let value = inputValue[field];
      if (value !== undefined) {

        // TODO(burdon): Hack (on client field is an item; on the server it's just an ID).
        if (field === 'id' && _.isObject(fieldValue)) {
          fieldValue = fieldValue.id;
        }

        match = not ? (fieldValue !== value) : (fieldValue === value);
        return false;
      }
    });

    return match;
  }

  static isGreaterThan(fieldValue, inputValue, eq) {

    let match = false;
    _.each(Matcher.SCALARS, field => {
      let value = inputValue[field];
      if (value !== undefined) {
        match = eq ? (fieldValue >= value) : (fieldValue > value);
        return false;
      }
    });

    return match;
  }

  static isLessThan(fieldValue, inputValue, eq) {

    let match = false;
    _.each(Matcher.SCALARS, field => {
      let value = inputValue[field];
      if (value !== undefined) {
        match = eq ? (fieldValue <= value) : (fieldValue < value);
        return false;
      }
    });

    return match;
  }
}
