import { parse } from "../src/abparser/abparser";
import lex from "../src/lexer";
import run from "../src/runner";

// Runs ABLang source and returns what it printed, plus the final variables.
function runSource(source: string): { output: string[]; env: Map<string, any> } {
    const output: string[] = [];
    const spy = jest.spyOn(console, "log").mockImplementation((v) => {
        output.push(String(v));
    });
    const env = new Map<string, any>();
    try {
        run(parse(lex(source)), env);
    } finally {
        spy.mockRestore();
    }
    return { output, env };
}

describe("Runner: let statements", () => {
    it("Should store a number", () => {
        expect(runSource("let i = 5").env.get("i")).toBe(5);
    });

    it("Should store a string", () => {
        expect(runSource('let s = "hi"').env.get("s")).toBe("hi");
    });

    it("Should evaluate complex expressions dynamically", () => {
        const { env } = runSource("let x = (1 + 2) * 3 - 8 / 2");
        expect(env.get("x")).toBe(5);
    });

    it("Should respect operator precedence and parentheses", () => {
        const { env } = runSource(
            "let x = 2 + 3 * 4\nlet y = (2 + 3) * 4\nlet z = 10 / 2 + 3\n"
        );
        expect(env.get("x")).toBe(14);
        expect(env.get("y")).toBe(20);
        expect(env.get("z")).toBe(8);
    });

    it("Should evaluate same-precedence operators left to right", () => {
        const { env } = runSource("let x = 8 - 3 - 2\nlet y = 20 / 5 / 2\n");
        expect(env.get("x")).toBe(3);
        expect(env.get("y")).toBe(2);
    });

    it("Should resolve variables recursively inside nested expressions", () => {
        const { env } = runSource(
            "let x = 4\nlet y = x + 2\nlet x = x * 2\nlet z = (x + y) / 2\n"
        );
        expect(env.get("x")).toBe(8);
        expect(env.get("y")).toBe(6);
        expect(env.get("z")).toBe(7);
    });

    it("Should support boolean expressions built from arithmetic and comparisons", () => {
        const { output } = runSource(
            "let x = 5\nlet y = 2\nprint x * y > 8\nprint (x - y) == 3\nprint (x + y) != 7\n"
        );
        expect(output).toEqual(["True", "True", "False"]);
    });

    it("Should store comparison results", () => {
        expect(runSource("let b = 1 + 1 == 2").env.get("b")).toBe(true);
    });

    it("Should read variables in later expressions", () => {
        const { env } = runSource("let a = 2\nlet b = a * 3\nlet c = (a + b) * a\n");
        expect(env.get("b")).toBe(6);
        expect(env.get("c")).toBe(16);
    });

    it("Should print variables", () => {
        const { output } = runSource("let a = 4\nprint a + 1\nprint a\n");
        expect(output).toEqual(["5", "4"]);
    });

    it("Should allow reassigning a variable", () => {
        const { env } = runSource("let a = 1\nlet a = a + 1\n");
        expect(env.get("a")).toBe(2);
    });

    it("Should use variables in if conditions", () => {
        const { output } = runSource(
            'let a = 3\nif a > 2:\n    print "big"\nif a > 5:\n    print "huge"\n'
        );
        expect(output).toEqual(["big"]);
    });

    it("Should resolve outer variables inside if blocks", () => {
        const { env } = runSource(
            "let a = 1\nif a == 1:\n    let b = a + 1\n"
        );
        expect(env.get("a")).toBe(1);
        expect(env.has("b")).toBe(false);
    });

    it("Should keep block-local variables isolated from the outer scope", () => {
        const { env } = runSource(
            "let a = 1\nif a == 1:\n    let a = 10\n    let b = a + 1\n"
        );
        expect(env.get("a")).toBe(1);
        expect(env.has("b")).toBe(false);
    });

    it("Should allow nested if blocks to read outer values", () => {
        const { env, output } = runSource(
            "let a = 2\nif a > 1:\n    if a == 2:\n        print a + 3\n"
        );
        expect(output).toEqual(["5"]);
        expect(env.get("a")).toBe(2);
    });

    it("Should keep nested block shadowing local to the inner block", () => {
        const { env, output } = runSource(
            "let a = 1\nif a == 1:\n    let a = 10\n    if a > 5:\n        print a\n"
        );
        expect(output).toEqual(["10"]);
        expect(env.get("a")).toBe(1);
    });

    it("Should not leak inner-scope variables to outer scope after nested blocks", () => {
        const { env } = runSource(
            "let a = 1\nif a == 1:\n    let x = 99\n    if True:\n        let y = x + 1\n"
        );
        expect(env.get("a")).toBe(1);
        expect(env.has("x")).toBe(false);
        expect(env.has("y")).toBe(false);
    });

    it("Should not run assignments in a false if block", () => {
        const { env } = runSource("let a = 1\nif a == 2:\n    let b = 5\n");
        expect(env.has("b")).toBe(false);
    });

    it("Should throw a runtime error for undefined variables", () => {
        expect(() => runSource("print missing")).toThrow(/Undefined variable/);
        expect(() => runSource("let a = missing + 1")).toThrow(/Undefined variable/);
    });

    it("Should throw on division by zero in an assignment", () => {
        expect(() => runSource("let a = 1 / 0")).toThrow(/Division by zero/);
    });

    it("Should not mutate the AST when evaluating", () => {
        const ast = parse(lex("let a = 1\nlet b = a + 1\n"));
        const first = new Map<string, any>();
        const second = new Map<string, any>();
        run(ast, first);
        run(ast, second);
        expect(second.get("b")).toBe(2);
    });
});
