const testConfig = require('./testConfig.js');
const { exec } = require('child_process');

describe('Runner', () => {
    it('Should correctly execute program.abl', () => {
        exec(`node ${testConfig.ABLANG_JS_PATH} ${testConfig.PROGRAM_ABL_PATH}`, (error, stdout, stderr) => {
            expect(error).toBeNull();
            expect(stdout).toBe(testConfig.PROGRAM_ABL_EXPECTED_OUTPUT);
        });
    });

    it('Should throw an error for division by zero', () => {
        const ast = [
            new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
                new Operation(10, operatorTypes.DIVISION, 0),
            ])),
        ];
        expect(() => run(ast)).toThrow(ERROR);
    });

    it('Should throw an error for unsupported node types', () => {
        const ast = [new Node('UNSUPPORTED', 123)];
        expect(() => run(ast)).toThrow('Unsupported Error: Only print statements are supported');
    });

    it('should throw an error for unknown operator types', () => {
        const ast = [new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, 'INVALID_OPERATOR', 2),
        ]))];
        expect(() => run(ast)).toThrow('Report This Bug: Unknown operator type: INVALID_OPERATOR');
    });
});
