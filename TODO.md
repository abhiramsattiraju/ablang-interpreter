# TODO

## Parser / syntax

- Syntax error: No then block
- Syntax error for empty if statement
- Handle blank lines at if statements
- Handle trailing whitespace at EOL
- Handle trailing whitespace on a blank line between lines of code
- Fail gracefully at unexpected indent
- Internal error if there is an unexpected indent in the then-block

## Naming

- Remove `TOKEN_TYPES_` in the naming

## Comments

- Implement comments
- Add comments to `program.abl`

## Tests

- Add lots of tests (mainly whitespace-related)
  - Mixed `print` statements and stand-alone expressions in the then-block
  - Nested indents
  - Multiple lines in the then-block

## Migration

- Migrate to typescript
