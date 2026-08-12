# Abstract Syntax Tree Documentation

## Overview
The Abstract Syntax Tree (AST) is the intermediate representation used by the ABLang interpreter to represent parsed programs. Each node in the tree represents a program construct.

The AST is an array of `Node` objects (`Node[]`).

## Node Structure

In TypeScript, AST nodes are instances of the `Node` class ([src/abparser/node_classes.ts](file:///home/srika/Coding/WorkInProgress/ablang-interpreter/src/abparser/node_classes.ts)):

```typescript
class Node {
    type: number | null;
    value: any;
}
```

## Node Types

Node type constants are defined in [src/abparser/ast_node_types.ts](file:///home/srika/Coding/WorkInProgress/ablang-interpreter/src/abparser/ast_node_types.ts):

| Type Constant | Value | Description |
| :--- | :--- | :--- |
| `NODE_TYPE_EXPRESSION` | `1` | An expression containing one or more `Operation` objects. |
| `NODE_TYPE_NUMBER` | `2` | Numeric literal. |
| `NODE_TYPE_STRING` | `3` | String literal. |
| `NODE_TYPE_OPERATOR` | `4` | Operator token node used internally during parsing. |
| `NODE_TYPE_PRINT_STATEMENT` | `5` | Print statement whose `value` is an expression `Node`. |
| `NODE_TYPE_BOOLEAN` | `6` | Boolean literal (`true` or `false`). |
| `NODE_TYPE_IF_STATEMENT` | `7` | `if` statement whose `value` is an `IfStatement` object. |

### Node Type Details

#### Expression Node (`NODE_TYPE_EXPRESSION` = 1)
Contains an array of `Operation` objects representing evaluated expressions or sub-expressions.

```typescript
Node {
    type: 1, // NODE_TYPE_EXPRESSION
    value: Operation[]
}
```

#### Number Node (`NODE_TYPE_NUMBER` = 2)
Represents numeric literals.

```typescript
Node {
    type: 2, // NODE_TYPE_NUMBER
    value: 123 // numeric value
}
```

#### String Node (`NODE_TYPE_STRING` = 3)
Represents string literals.

```typescript
Node {
    type: 3, // NODE_TYPE_STRING
    value: "hello" // string value
}
```

#### Operator Node (`NODE_TYPE_OPERATOR` = 4)
Represents an operator symbol, primarily used as an intermediate representation during parsing.

```typescript
Node {
    type: 4, // NODE_TYPE_OPERATOR
    value: "+" // operator string
}
```

#### Print Statement Node (`NODE_TYPE_PRINT_STATEMENT` = 5)
Represents a `print` statement. Its `value` is a `NODE_TYPE_EXPRESSION` `Node`.

```typescript
Node {
    type: 5, // NODE_TYPE_PRINT_STATEMENT
    value: Node { type: 1, value: [...] } // Expression Node
}
```

#### Boolean Node (`NODE_TYPE_BOOLEAN` = 6)
Represents boolean literals (`True` or `False`).

```typescript
Node {
    type: 6, // NODE_TYPE_BOOLEAN
    value: true // boolean value (true | false)
}
```

#### If Statement Node (`NODE_TYPE_IF_STATEMENT` = 7)
Represents an `if` statement construct. Its `value` is an `IfStatement` instance containing a `condition` (`Node`) and `body` (`Node[]`).

```typescript
Node {
    type: 7, // NODE_TYPE_IF_STATEMENT
    value: IfStatement {
        condition: Node { type: 1, value: [...] }, // condition Expression Node
        body: [ ... ] // array of statement Nodes
    }
}
```

---

## Operations

### Structure

Expression nodes store operations using the `Operation` class ([src/abparser/node_classes.ts](file:///home/srika/Coding/WorkInProgress/ablang-interpreter/src/abparser/node_classes.ts)):

```typescript
class Operation {
    leftOperand: any;
    operator: number;
    rightOperand: any;
}
```

- **Primitive Operands**: Direct primitive values such as `number`, `string`, or `boolean` (e.g., `5`, `"Hello"`, `true`).
- **Nested Operations**: Nested expressions or sub-expressions wrapped in round brackets `(...)` are represented as single-element arrays containing an `Operation` object (e.g., `[ Operation { ... } ]`).
- **Single-Value Expressions**: Single-value expressions (e.g., `print 5` or `print "hi"`) use `operator: LEAVE_AS_IS` (10) and `rightOperand: null`.

### Operator Types

Operator type constants are defined in [src/abparser/operator_types.ts](file:///home/srika/Coding/WorkInProgress/ablang-interpreter/src/abparser/operator_types.ts):

| Constant | Value | Symbol | Description |
| :--- | :--- | :--- | :--- |
| `ADDITION` | `6` | `+` | Addition operation |
| `SUBTRACTION` | `7` | `-` | Subtraction operation |
| `MULTIPLICATION` | `8` | `*` | Multiplication operation |
| `DIVISION` | `9` | `/` | Division operation |
| `LEAVE_AS_IS` | `10` | N/A | Pass-through for single operand values |
| `GREATER_THAN` | `11` | `>` | Greater-than comparison |
| `LESS_THAN` | `12` | `<` | Less-than comparison |
| `GREATER_THAN_OR_EQUAL` | `13` | `>=` | Greater-than-or-equal comparison |
| `LESS_THAN_OR_EQUAL` | `14` | `<=` | Less-than-or-equal comparison |
| `EQUAL` | `15` | `==` | Equality comparison |
| `NOT_EQUAL` | `16` | `!=` | Inequality comparison |

---

## Example AST

For the program:
```ablang
print "Hello, world!"
print 2 + 3 * 4
print 56 >= 78
```

The parsed AST is:
```typescript
[
    // print "Hello, world!"
    Node {
        type: 5, // NODE_TYPE_PRINT_STATEMENT
        value: Node {
            type: 1, // NODE_TYPE_EXPRESSION
            value: [
                Operation {
                    leftOperand: "Hello, world!",
                    operator: 10, // LEAVE_AS_IS
                    rightOperand: null
                }
            ]
        }
    },
    // print 2 + 3 * 4
    Node {
        type: 5, // NODE_TYPE_PRINT_STATEMENT
        value: Node {
            type: 1, // NODE_TYPE_EXPRESSION
            value: [
                Operation {
                    leftOperand: 2,
                    operator: 6, // ADDITION
                    rightOperand: [
                        Operation {
                            leftOperand: 3,
                            operator: 8, // MULTIPLICATION
                            rightOperand: 4
                        }
                    ]
                }
            ]
        }
    },
    // print 56 >= 78
    Node {
        type: 5, // NODE_TYPE_PRINT_STATEMENT
        value: Node {
            type: 1, // NODE_TYPE_EXPRESSION
            value: [
                Operation {
                    leftOperand: 56,
                    operator: 13, // GREATER_THAN_OR_EQUAL
                    rightOperand: 78
                }
            ]
        }
    }
]
```
