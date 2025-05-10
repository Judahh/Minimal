import { tokenize } from "./lexer";
import fs from "fs";
import { Parser } from "./parser";

// use main function to run the lexer, using args as source code
function main(args: string[]) {
    // get arg as the source code file
    console.log("args");
    console.log(args);
    const file = args[0];
    const outputT = args[1] || file + ".tokens.json";
    const outputA = args[1] || file + ".ast.json";
    const sourceCode = fs.readFileSync(file, "utf-8");

    const tokens = tokenize(sourceCode);
    console.log(tokens);
    fs.writeFileSync(outputT, JSON.stringify(tokens, null, 2));

    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));
    
    fs.writeFileSync(outputA, JSON.stringify(ast, null, 2));
}

// run main function
main(process.argv.slice(2));