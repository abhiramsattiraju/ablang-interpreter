// The exceptions functionality.

function raiseException(type, message) {
    console.error(`${type}: ${message}`);
    process.exit(1);
}

module.exports = {
    raiseException: raiseException,

    // Error codes
    EXCEPTION: "Exception",
    SYNTAX_ERROR: "Syntax error",
    REPORT_THIS_BUG: "Report this bug",
    UNSUPPORTED_ERROR: 'Unsupported',
    RUNTIME_ERROR: 'Runtime error',
}
