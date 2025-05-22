import { tokenize } from "./lexer";
import fs from "fs";
import { Parser } from "./parser";

function isMinimal(filename: string) {
    return filename.endsWith(".minimal") || filename.endsWith(".min") || filename.endsWith(".mon") || filename.includes(".bmon") || filename.includes(".mona") || filename.includes(".bmona");
}

// use main function to run the lexer, using args as source code
function main(args: string[]) {
    // get arg as the source code file
    const outputs = args.filter((arg) => {
        // check if arg is a directory
        const out = !arg.includes(".") && !(isMinimal(arg) || arg.includes("*"));
        try {
            if (fs.lstatSync(arg).isDirectory()) {
                return false;
            }
        } catch (error) {

        }
        return out;
    });
    args = args.filter((arg) => {
        return (isMinimal(arg) || arg.includes("*")) && !arg.includes(".symb.");
    });
    console.log("args");
    console.log(args);
    console.log("outputs");
    console.log(outputs);
    const output = outputs[0];

    if (args) {
        args.forEach((arg) => {
            console.log(`Building ${arg}`);

            if (arg.endsWith(".min") || arg.endsWith(".mon")) {
                build(arg, output);
            }
        });
    } else {
        console.error("No file provided");
    }

}

function build(file: string, output: string) {
    const outputT = (output || file) + ".tokens.json";
    const outputA = (output || file) + ".ast.json";
    console.log(`Building ${file}`);
    const sourceCode = fs.readFileSync(file, "utf-8");

    const tokens = tokenize(sourceCode);
    console.log(tokens);
    fs.writeFileSync(outputT, JSON.stringify(tokens, null, 2));

    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));

    fs.writeFileSync(outputA, JSON.stringify(ast, null, 2));
}

console.log('BUILD');
// run main function
main(process.argv.slice(2));