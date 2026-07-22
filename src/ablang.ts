import lexer from "./lexer";
import { parse } from "./abparser/abparser";
import runner from "./runner";
import * as exceptions from "./exceptions";
import * as fs from "fs";

function main(): void {
    if (process.argv.length !== 3) {
        exceptions.raiseException(
            exceptions.EXCEPTION,
            "Invalid command line arguments.\nUsage: node ablang.js <program file>"
        );
    }

    // Read the source file.
    const source_code = fs.readFileSync(process.argv[2], "utf8");
    // Lex the source code.
    const token_stream = lexer(source_code);
    // Parse the token stream.
    const ast = parse(token_stream);
    // Run the ast.
    runner(ast);
}

main();
