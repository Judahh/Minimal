import { tokenize } from "./lexer";
import fs from "fs";

// use main function to run the lexer, using args as source code
function main(args: string[]) {
    // get arg as the source code file
    console.log("args");
    console.log(args);
    const file = args[0];
    const output = args[1] || file + ".tokens.json";
    const sourceCode = fs.readFileSync(file, "utf-8");
    const tokens = tokenize(sourceCode);
    console.log(tokens);
    fs.writeFileSync(output, JSON.stringify(tokens, null, 2));
}

// run main function
main(process.argv.slice(2));