const properties = {};

const actions = {
  show: 'show',
  hide: 'hide'
};
actions.all = Object.keys(actions);
properties.actions = actions;

const evals = {
  and: 'and',
  or: 'or',
};
evals.all = Object.keys(evals);
properties.evals = evals;

const conditions = {
  filled: '*=',
  empty: 'null=',
  equal: '=',
  notEqual: '!=',
  contain: '?=',
  greaterThan: '>',
  lessThan: '<',
};
conditions.all = Object.keys(conditions).map((key) => conditions[key]);
properties.conditions = conditions;

export default properties;
