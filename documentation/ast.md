# Abstract Syntax Tree Documentation

## Overview
The Abstract Syntax Tree (AST) is the intermediate representation used by the ABLang interpreter to represent parsed programs. Each node in the tree represents a program construct.

The AST is an array of nodes.

## Node Types

### Expression Node

  ```javascript
  {
    type: NODE_TYPE_EXPRESSION,
    value: [Operation objects]
  }
  ```

### Print Statement Node

  ```javascript
  {
    type: NODE_TYPE_PRINT_STATEMENT,
    value: expression to print
  }
  ```

### Number Node

Represents numeric literals.

  ```javascript
  {
    type: NODE_TYPE_NUMBER,
    value: numeric value
  }
  ```

### Operator Node

  ```javascript
  {
    type: NODE_TYPE_OPERATOR,
    value: operator string
  }
  ```

  Examples of operator strings:
  ```javascript
'+', '-', '*', '/'
  ```

### String Node

Represents string literals.

  ```javascript
  {
    type: NODE_TYPE_STRING,
    value: string value
  }
  ```

## Operations

### Structure

```javascript
{
    leftOperand: left operand value,
    operator: operatorType,
    rightOperand: right operand value
}
```

Operand values are not stored as `Node` objects. They are stored as their literal value.

For example, if the number 5 was the left operand, it `leftOperand` would not be a `Node` object, it would be `5`.

Likewise, if a string `"hi"` was the left operand, `leftOperand` would be `"hi"`.

If a round-bracketed expression was to be an operand, it would be stored as an array of `Operation` objects.

### Operator Types
- `LEAVE_AS_IS`: Keep the value unchanged.
- `ADDITION`
- `SUBTRACTION`
- `MULTIPLICATION`
- `DIVISION`

## Example AST
For the program:
```ablang
print "Hello, world!";
print 2 + 3 * 4;
```

The AST would be:
```javascript
[
    Node {
        type: NODE_TYPE_PRINT_STATEMENT,
        value: Node {
            type: NODE_TYPE_EXPRESSION,
            value: [
                Operation {
                    leftOperand: "Hello, world!",
                    operator: LEAVE_AS_IS,
                    rightOperand: null
                }
            ]
        }
    },
    Node {
        type: NODE_TYPE_PRINT_STATEMENT,
        value: Node {
            type: NODE_TYPE_EXPRESSION,
            value: [
                Operation {
                    leftOperand: 2,
                    operator: ADDITION,
                    rightOperand: Operation {
                        leftOperand: 3,
                        operator: MULTIPLICATION,
                        rightOperand: 4
                    }
                }
            ]
        }
    }
]
```
