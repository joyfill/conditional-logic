import LogicConstants from './constants/Logic';

/**
 * Apply visibility logic to items
 *
 * What does visibility logic mean? This means that
 * items are either hidden or shown based on their
 * default visibility status "hidden: true|false" or
 * the resolved logic conditions that will change 
 * their visibility status to true or false.
 *
 * @param {Object_Array} items
 * @param {Object_Array} fields 
 * @param {String} fieldLookupKey
 *
 * @returns {Object_Array} items
 */
export const applyLogic = (items, fields, fieldLookupKey) => {

  /**
   * Create field value lookup for logic
   */
  const fieldLookup = {};
  fields.forEach((field) => {
    fieldLookup[fieldLookupKey] = field;
  });

  const evaluatedItems = items.map((item) => {

    const nextItem = {...item};

    const hasLogic = (item.logic && item.logic.action && item.logic.eval && item.logic.conditions && item.logic.conditions.length > 0);

    /**
     * Step 1: Prevent hidden items if only one item exists
     * - If only one item exists then we do not want to hide it so we need to ensure hidden is false.
     */
    if (items.length < 2) {

      nextItem.hidden = false;
      return nextItem;

    } 

    /**
     * Step 2: No logic exists and item is not hidden
     * - If item is not hidden and no logic exists then the item should be visible.
     */
    else if (!hasLogic && !item.hidden) {
      return nextItem;
    }

    /**
     * Step 3: No logic exists and item is hidden
     * - If item is hidden and no logic exists to show the item then the item should not be visible.
     */
    else if (!hasLogic && item.hidden) {
      return nextItem;
    } 

    /**
     * Step 4: Has logic, item is hidden, and logic.action is not show
     * - If item is hidden and the logic that exists does not have a "show" action then we simply leave the item hidden.
     */
    else if (hasLogic && item.hidden && item.logic.action !== LogicConstants.actions.show) {
      return nextItem;
    }

    /**
     * Step 5: Evaluate logic condition
     */ 
    const matchingConditions = [];
    const validConditions = item.logic.conditions.filter((condition) => {
      /**
       * A condition is only valid if it has a undeleted page, undeleted field and condition.
       * We do not check the value because that could be anything depending on what they're
       * trying to match against.
       */
      return fieldLookup[condition.field] && condition.condition;
    });

    validConditions.forEach((condition) => {

      const targetField = fieldLookup[condition.field];

      /**
       * Filled
       * - Matches against any entered value and non-empty arrays.
       */
      if (
        condition.condition === LogicConstants.conditions.filled 
        && ((targetField.value && !Array.isArray(targetField.value)) || (targetField.value && Array.isArray(targetField.value) && targetField.value.length > 0))
      ) {
        return matchingConditions.push(condition);
      } 

      /**
       * Empty
       * - Matches against empty string, undefined, null, or empty array.
       */
      if (
        condition.condition === LogicConstants.conditions.empty
        && (targetField.value === '' || targetField.value === undefined || (Array.isArray(targetField.value) && targetField.value.length < 1))
      ) {
        return matchingConditions.push(condition);
      } 

      /**
       * Equals
       * - Case-insenstive exact match
       */
      if (
        condition.condition === LogicConstants.conditions.equal
        && (
          (!Array.isArray(targetField.value) && new RegExp(`^${condition.value}$`, 'i').test(targetField.value))
          || (Array.isArray(targetField.value) && targetField.value.indexOf(condition.value) !== -1)
        )
      ) {
        return matchingConditions.push(condition);
      } 

      /**
       * Not Equals
       * - Case-insenstive exact match
       */
      if (
        condition.condition === LogicConstants.conditions.notEqual
        && (
          (!Array.isArray(targetField.value) && !(new RegExp(`^${condition.value}$`, 'i').test(targetField.value)))
          || (Array.isArray(targetField.value) && targetField.value.indexOf(condition.value) === -1)
        )
      ) {
        return matchingConditions.push(condition);
      } 

      /**
       * Contains
       * - Case-insenstive match anywhere in value
       */
      if (
        condition.condition === LogicConstants.conditions.contain
        && new RegExp(condition.value, 'gi').test(targetField.value)
       ) {
         return matchingConditions.push(condition);
       }

      /**
       * Greater Than
       */
      if (
        condition.condition === LogicConstants.conditions.greaterThan
        && targetField.value > condition.value
       ) {
         return matchingConditions.push(condition);
       }

      /**
       * Less Than
       */
      if (
        condition.condition === LogicConstants.conditions.lessThan
        && targetField.value < condition.value
       ) {
         return matchingConditions.push(condition);
       }

    });

    /**
     * Step 6: Match conditions against eval criteria
     */
    let evalSuccess = false; 

    if (item.logic.eval === LogicConstants.evals.or && matchingConditions.length > 0) evalSuccess = true;
    if (item.logic.eval === LogicConstants.evals.and && matchingConditions.length === validConditions.length) evalSuccess = true;

    if (evalSuccess && item.logic.action === LogicConstants.actions.show) nextItem.hidden = false;
    else if (evalSuccess && item.logic.action === LogicConstants.actions.hide) nextItem.hidden = true;

    return nextItem;

  });

  return evaluatedItems;

}

export default applyLogic;
