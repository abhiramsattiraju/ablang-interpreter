const testConfig = require('./test_config.js');
const { exec } = require('child_process');
const { Node, Operation } = require('../abparser/node_classes.js');
const {
    NODE_TYPE_EXPRESSION,
    NODE_TYPE_PRINT_STATEMENT,
} = require('../abparser/ast_node_types.js');
const operatorTypes = require('../abparser/operator_types.js');

describe('Runner', () => {
    it('Should correctly execute program.abl', () => {
        exec(`node ${testConfig.ABLANG_JS_PATH} ${testConfig.PROGRAM_ABL_PATH}`, (error, stdout, stderr) => {
            expect(error).toBeNull();
            expect(stdout).toEqual(testConfig.PROGRAM_ABL_EXPECTED_OUTPUT);
        });
    });

    it('Should throw an error for division by zero', () => {
        const ast = [
            new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
                new Operation(10, operatorTypes.DIVISION, 0),
            ])),
        ];
        expect(() => run(ast)).toThrow(Error);
    });

    it('Should throw an error for unsupported node types', () => {
        const ast = [new Node('UNSUPPORTED', 123)];
        expect(() => run(ast)).toThrow(Error);
    });

    it('should throw an error for unknown operator types', () => {
        const ast = [new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, 'INVALID_OPERATOR', 2),
        ]))];
        expect(() => run(ast)).toThrow(Error);
    });
});
