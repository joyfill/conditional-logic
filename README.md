# Joyfill Conditional Form Logic

![joyfill_logo](https://github.com/joyfill/examples/assets/5873346/ed8c5d64-7e27-40d5-a185-14cb14d1aa3a)

 [Joyfill Developers](https://docs.joyfill.io/docs)

## Why this library exists

Joyfill is a forms platform with APIs and SDKs built to take the burden of building form and pdf solutions off of developers and product teams. Our Embeddable Form SDKs for JS, Angular, Vue, React, React-Native, etc. utilize this library to handle the visibility evaluation logic for fields and pages. We have open sourced this library to enable other developers to utilize the same conditional logic we use. Enjoy!

# Overview

The goal of conditional logic evaluation is to determine if an item needs to be displayed or hidden based on a set of conditions.

Item’s passed to the library will either have hidden: true by default (representing hidden items) or hidden: false|undefined by default (representing shown items). The library will evaluate the item’s logic (if present) to determine if the value of the hidden property should be changed or left the same.


# Usage


```jsx
import { applyLogic } from "@joyfill/conditional-logic";

const fields = [
  { _id: "field_one", type: "text", value: "hello world" },
  { _id: "field_two", type: "number", value: 100 },
  { _id: "field_three", type: "multiSelect", value: ["option_one"] }
];

const items = [
  { 
    _id: "conditional_one", 
    hidden: true,
    logic: {
      action: "show",
      eval: "and",
      conditions: [
        {
          field: "field_one",
          condition: "?=",
          value: "hello"
        }
      ]
    }  
  }
]

const evaluatedItems = applyLogic(items, fields, "_id");

console.log(evaluatedItems[0].hidden); 
/**
 * Logs false.
 * 
 * Why? The logic associated with that item has an action to show 
 * the item if "field_one" contains "hello" in the value property. 
 * Since "field_one" value matches that condition the hidden 
 * property is changed to "hidden: false".
 */

```

In most cases when using this library the fields argument and items argument will be same array of objects. Why is this? This is because when you’re talking about conditional logic for forms the conditions to show or hide fields will be determined by the other field values on the form. For instance, show field B when field A has the proper value entered into it. In the example below I split the arrays into two for readability.


# Available Methods

## applyLogic(items, fields, fieldLookupKey)

Evaluates the logic on each item and sets the `hidden` property to either true or false depending on if they should be shown or hidden. 

- `items` - Object_Array
- `fields` - Object_Array
- `fieldLookupKey` - String

# Item Logic Overview

## Properties

- `action`
  - **Description:** Should the item be shown or hidden based on evaluated conditions.
  - **Options**
    - `show` - Item should be shown (`hidden: false`) when conditions are met.
    - `hide` - Item should be hidden (`hidden: true`) when conditions a met.
- `eval`
  - **Options**
    - `and` - All conditions must be met.
    - `or` - Only one condition must be met.
    - `conditions`
    - `field` - The that will be used to retrieve the associated field you want to evaluate the value of.
    - `value` - The value you will evaluate against the associated field. Supports string and number types.
- `condition` - What type of evaluation check to perform against the logic condition value and field value. Only certain conditions cab be used with certain field value data types (see field value types below the condition option for specifics).
  - **Options**
    - **Filled** `*=`
      - *String* - Successfully matches any non-empty string value.
      - *Number* - Successfully matches any numerical value.
      - *String_Array* - Successfully matches any non-empty array.
    - **Empty** `null=`
      - *String* - Successfully matches any non-empty string value.
      - *Number* - Successfully matches any numerical value.
      - *String_Array* - Successfully matches any non-empty array.
    - **Equals** `=`
      - *String* - Successfully matches with exact string match (case-insensitve).
      - *Number* - Successfully matches with exact numerical value.
      - *String_Array* - Successfully matches when string is found inside of array.
    - **Not Equal** `!=`
      - *String* - Successfully matches with no exact string match (case-insensitve).
      - *Number* - Successfully matches with no exact numerical value.
      - *String_Array* - Successfully matches when string is not found inside of array.
    - **Contains** `?=`
      - *String* - Successfully matches with exact string match anywhere in the field value (case-insensitve).
    - **Greater Than** `>`
      - **Number** - Successfully matches when field value is greater.
    - **Less Than** `<`
      - **Number** - Successfully matches when field value is greater.

## Item with logic example

```jsx
{ //Item
  ...,
  logic: {
    action: 'show',
    eval: 'and',
    conditions: [
      {
        field: 'field_id',
        condition: '=',
        value: 'hello'
      }
    ]
  }
}
```

# Fields Overview

## Properties

- Lookup Key - This is the property that the `logic.condition[x].field` is referencing. This must be unique per-field.
- `type` - Will be used in the future to allow custom condition value evaluations.
- `value` - The value that will be used in the associated item condition evaluation.
    - ******************************Supported Types******************************
        - String
        - Number
        - String_Array

## Field example

```jsx
  [ //Fields Array
    { //Field Object
      "id": "unique_id",
      "type": "custom_type",
      "value": "hello world"
    },
    ...
  ]
```

# Hidden and Logic Evaluation Steps

The goal of conditional logic evaluation is to determine if an item needs to be displayed or hidden based on a set of conditions. 

Item’s passed to the library will either have `hidden: true` by default (representing hidden items) or `hidden: false|undefined` by default (representing shown items). The library will evaluate the item’s logic (if present) to determine if the value of the hidden property should be changed or left the same.

Below are the steps used to determine if we should show or hide items after evaluating their logic. The show or hide action is determined by the `item.logic.action` property. 

## Hidden Items (`hidden: true`)

Below are the steps used to determine if we should change the hidden property to show the item (`hidden: false`) or leave an item hidden (`hidden: true`). 

- **Step 1:** Is there only one item in the array of items?
    - **Yes** - Item will be shown (`hidden: false`). Skips all other steps.
    - **No** - Continue to step 2.
- **Step 2:** Is there valid logic on this item?
    - **Yes** - Continue to step 3
    - **No** - Leave item hidden (`hidden: true`). Skip all other steps.
- **Step 3:** Does the logic for this item have a show action (`logic.action === 'show'`)
    - **Yes** - Continue to step 4.
    - **No -** Leave item hidden (`hidden: true`). Skip all other steps.
- **Step 4:** Evaluate logic conditions

## Shown Items (`hidden: false|undefined`)

Below are the steps used to determine if we should change the hidden property to hide the item (`hidden: true`) or leave an item shown (`hidden: false`). 

- **Step 1:** Is there only one item in the array of items?
    - **Yes** - Item will be shown (`hidden: false`). Skips all other steps.
    - **No** - Continue to step 2.
- **Step 2:** Is there valid logic on this item?
    - **Yes** - Continue to step 3
    - **No** - Leave item shown (`hidden: false`). Skip all other steps.
- **Step 3:** Does the logic for this item have a hide action (`logic.action === 'hide'`)
    - **Yes** - Continue to step 4.
    - **No -** Leave item shown (`hidden: false`). Skip all other steps.
- **Step 4:** Evaluate logic conditions


