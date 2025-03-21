let lexer = require('./lexer.js');
let {parse} = require('./abparser/abparser.js');
let runner = require('./runner.js');
let exceptions = require('./exceptions.js');
let fs = require('fs');


function main() {
    if(process.argv.length !== 3) {
        exceptions.raiseException(
            exceptions.EXCEPTION,
'Invalid command line arguments.\n\
Usage: node ablang.js <program file>'
        );
    }

    // Read the source file.
    let source_code = fs.readFileSync(process.argv[2], 'utf8');
    // Lex the source code.
    let token_stream = lexer(source_code);
    // Parse the token stream.
    let ast = parse(token_stream);
    // Run the ast.
    runner(ast);
}

// A dummy function to test the test suite.
function add(x, y) {
    return x + y;
}


main();
