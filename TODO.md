# TODO

## Parser / lexer / syntax

- Handle trailing whitespace at EOL
- Handle trailing whitespace on a blank line between lines of code
- Fail gracefully at unexpected indent
- Internal error if there is an unexpected indent in the then-block
- Support single quote strings

## Naming

- Remove `TOKEN_TYPES_` in the naming

## Comments

- Implement comments
- Add comments to `program.abl`

## Tests

- `simple_program.abl` should not have semicolons.
- More tests for if-statements with their own abl files.

- Add lots of tests (mainly whitespace-related)
  - Mixed `print` statements and stand-alone expressions in the then-block
  - Nested indents
  - Multiple lines in the then-block

## Organisation

- Fix the naming convention mess for node types and token types.
