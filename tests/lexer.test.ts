import lex from "../src/lexer";
import * as tokenTypes from "../src/token_types";
import { Token } from "../src/token_class";

describe("Main lexer Tests", () => {
    it("Should lex numbers correctly", () => {
        const tokens = lex("123 45 6");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 45),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 6),
        ]);
    });

    it("Should lex operators correctly", () => {
        const tokens = lex("1 + 1 - 1 * 1 / 1 > 1 < 1 <= 1 >= 1 == 1 != 1");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "+"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "-"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "*"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "/"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, ">"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "<"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "<="),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, ">="),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "=="),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "!="),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
        ]);
    });

    it("Should throw an error for invalid operators", () => {
        expect(() => {
            lex("1 & 1");
        }).toThrow(Error);
        expect(() => {
            lex("1 ** 1");
        }).toThrow(Error);
    });

    it("Should throw an error for unterminated operators", () => {
        expect(() => {
            lex("1 +");
        }).toThrow(Error);
        expect(() => {
            lex("1 -");
        }).toThrow(Error);
        expect(() => {
            lex("1 *");
        }).toThrow(Error);
        expect(() => {
            lex("1 /");
        }).toThrow(Error);
        expect(() => {
            lex("1 >");
        }).toThrow(Error);
        expect(() => {
            lex("1 <");
        }).toThrow(Error);
        expect(() => {
            lex("1 <=");
        }).toThrow(Error);
        expect(() => {
            lex("1 >=");
        }).toThrow(Error);
        expect(() => {
            lex("1 ==");
        }).toThrow(Error);
        expect(() => {
            lex("1 !=");
        }).toThrow(Error);
    });

    it("Should lex round brackets correctly", () => {
        const tokens = lex("( )");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "("),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ")"),
        ]);
    });

    it("Should throw an error if a semicolon is found", () => {
        expect(() => {
            lex(";");
        }).toThrow(Error);
    });

    it("Should lex strings correctly", () => {
        const tokens = lex('"hello" "world"');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_STRING, "hello"),
            new Token(tokenTypes.TOKEN_TYPE_STRING, "world"),
        ]);
    });

    it("Should lex names and keywords correctly", () => {
        const tokens = lex("print myVariable _var1");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "print"),
            new Token(tokenTypes.TOKEN_TYPE_NAME, "myVariable"),
            new Token(tokenTypes.TOKEN_TYPE_NAME, "_var1"),
        ]);
    });

    it("Should lex mixed input correctly", () => {
        const tokens = lex('print(123 + "hello")');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "print"),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "("),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "+"),
            new Token(tokenTypes.TOKEN_TYPE_STRING, "hello"),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ")"),
        ]);
    });

    it("Should throw an error for invalid characters", () => {
        expect(() => {
            lex("@");
        }).toThrow(Error);
    });
});

describe("Lexer whitespace tests", () => {
    it("Should handle various whitespace combinations", () => {
        const tokens = lex('  print \t (  123  + "hello" \r )   ');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "print"),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "("),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "+"),
            new Token(tokenTypes.TOKEN_TYPE_STRING, "hello"),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ")"),
        ]);

        const tokens2 = lex("123\t\n\r  45  \t 6");
        expect(tokens2).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 45),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 6),
        ]);

        const tokens3 = lex('   "testString" \t\r  ');
        expect(tokens3).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_STRING, "testString"),
        ]);
    });

    it("Should handle edge case of empty string", () => {
        const tokens = lex("");
        expect(tokens).toEqual([]);
    });

    it("Should handle edge cases of only whitespace", () => {
        let tokens = lex(" \t\n\r ");
        expect(tokens).toEqual([new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n")]);

        tokens = lex(" \t\r ");
        expect(tokens).toEqual([]);

        tokens = lex(" \t \n\r\t\n  \n ");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
        ]);
    });

    it("Should throw an error for invalid numbers", () => {
        expect(() => {
            lex("123a");
        }).toThrow(Error);
    });

    it("Should throw an error for unterminated strings", () => {
        expect(() => {
            lex('"hello');
        }).toThrow(Error);
    });

    it("Should correctly lex true and false keywords", () => {
        const tokens = lex("True False");

        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "True"),
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "False"),
        ]);
    });

    it("Should handle single newline characters", () => {
        const tokens = lex("\n");
        expect(tokens).toEqual([new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n")]);
    });

    it("Should handle multiple newline characters", () => {
        const tokens = lex("\n\n\n");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
        ]);
    });

    it("Should handle newlines at the beginning and end of input", () => {
        const tokens = lex("\n1 + 2\n");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "+"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 2),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
        ]);
    });

    it("Should handle multiple adjacent newlines", () => {
        const tokens = lex("1 + 2\n\n3 * 4");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "+"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 2),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 3),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "*"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 4),
        ]);
    });

    it("Should handle newlines in string literals", () => {
        const tokens = lex('"hello\nworld"');
        expect(tokens).toEqual([new Token(tokenTypes.TOKEN_TYPE_STRING, "hello\nworld")]);
    });

    it("Should handle programs without a blank line at the end", () => {
        const tokens = lex("1 + 2\n3 * 4");
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "+"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 2),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 3),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "*"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 4),
        ]);
    });

    it("Should handle empty files", () => {
        const tokens = lex("");
        expect(tokens).toEqual([]);
    });

    it("Should lex if-statements", () => {
        const tokens = lex("if x > 0:\n    print(\"Positive\")");

        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "if"),
            new Token(tokenTypes.TOKEN_TYPE_NAME, "x"),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, ">"),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 0),
            new Token(tokenTypes.TOKEN_TYPE_COLON, ":"),
            new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"),
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "print"),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "("),
            new Token(tokenTypes.TOKEN_TYPE_STRING, "Positive"),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ")"),
        ]);
    });
});
