export function raiseException(type: string, message: string): never {
    throw new Error(`${type}: ${message}`);
}

export const EXCEPTION = "Exception";
export const SYNTAX_ERROR = "Syntax error";
export const REPORT_THIS_BUG = "Report this bug";
export const UNSUPPORTED_ERROR = "Unsupported";
export const RUNTIME_ERROR = "Runtime error";
