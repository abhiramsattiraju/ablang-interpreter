import * as fs from 'fs';
import * as path from 'path';

export function writeToLog(message: string): void {
    try {
        fs.appendFileSync(path.join(process.cwd(), 'ablang_log.txt'), message + '\n');
    } catch (err) {
        console.error("Failed to write to log file:", err);
    }
}
