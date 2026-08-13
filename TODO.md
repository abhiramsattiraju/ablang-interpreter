# TODO

## Parser / lexer / syntax

- Handle trailing whitespace at EOL
- Handle trailing whitespace on a blank line between lines of code
- Fail gracefully at unexpected indent
- Internal error if there is an unexpected indent in the then-block
- Support single quote strings
- Check if there are syntax errors thrown when it should be REPORT_THIS_BUG

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

- `simple_program.abl` should not have semicolons.

## Organisation

- Fix the naming convention mess for node types and token types.
