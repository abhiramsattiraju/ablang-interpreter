import * as testConfig from "./test_config";
import { exec } from "child_process";
import { promisify } from "util";
import { Node, Operation } from "../src/abparser/node_classes";
import {
    NODE_TYPE_EXPRESSION,
    NODE_TYPE_PRINT_STATEMENT,
} from "../src/abparser/ast_node_types";
import * as operatorTypes from "../src/abparser/operator_types";
import run from "../src/runner";

const execPromise = promisify(exec);

describe("Runner", () => {
    it("Should correctly execute program.abl", async () => {
        const { stdout } = await execPromise(
            `node ${testConfig.ABLANG_JS_PATH} ${testConfig.PROGRAM_ABL_PATH}`
        );
        // Normalize line endings to avoid CRLF/LF platform differences
        const normalizedStdout = stdout.replace(/\r\n/g, "\n");
        const normalizedExpected = testConfig.PROGRAM_ABL_EXPECTED_OUTPUT.replace(/\r\n/g, "\n");
        expect(normalizedStdout).toEqual(normalizedExpected);
    });

    it("Should throw an error for division by zero", () => {
        const ast = [
            new Node(
                NODE_TYPE_PRINT_STATEMENT,
                new Node(NODE_TYPE_EXPRESSION, [
                    new Operation(10, operatorTypes.DIVISION, 0),
                ])
            ),
        ];
        expect(() => run(ast)).toThrow(Error);
    });

    it("Should throw an error for unsupported node types", () => {
        const ast = [new Node("UNSUPPORTED" as any, 123)];
        expect(() => run(ast)).toThrow(Error);
    });

    it("should throw an error for unknown operator types", () => {
        const ast = [
            new Node(
                NODE_TYPE_PRINT_STATEMENT,
                new Node(NODE_TYPE_EXPRESSION, [
                    new Operation(1, "INVALID_OPERATOR" as any, 2),
                ])
            ),
        ];
        expect(() => run(ast)).toThrow(Error);
    });
});
