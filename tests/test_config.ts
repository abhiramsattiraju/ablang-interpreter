import * as path from "path";

const PROJECT_DIRECTORY = path.resolve(__dirname, "..");

export const PROGRAM_ABL_PATH = path.join(PROJECT_DIRECTORY, "tests", "program.abl");
export const ABLANG_JS_PATH = path.join(PROJECT_DIRECTORY, "dist", "ablang.js");
export const PROGRAM_ABL_EXPECTED_OUTPUT =
    "Hello world\n" +
    "14\n" +
    "2\n" +
    "4.5\n" +
    "7.5\n" +
    "11\n" +
    "80\n" +
    "True\n" +
    "123456789\n" +
    "565\n" +
    "heloo\n" +
    "False\n" +
    "True\n" +
    "False\n" +
    "True\n" +
    "False\n" +
    "True\n" +
    "\n" +
    "True\n" +
    "True\n" +
    "\n" +
    "True\n" +
    "False\n" +
    "\n\nHello\n\nFriends\n\n\n";
