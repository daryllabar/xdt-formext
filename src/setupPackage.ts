import fs from "fs";

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

function main() {
    const source = fs.readFileSync(__dirname + "/../package.json").toString("utf-8");
    const sourceObj = JSON.parse(source);
    sourceObj.scripts = {};
    sourceObj.devDependencies = {};
    replaceFolder(sourceObj, "main");
    replaceFolder(sourceObj, "types");
    if (sourceObj.files) {
        sourceObj.files = (sourceObj.files as string[]).map((v) => {
            return v.startsWith("dist/") ? v.slice(5) : v;
        });
    }
    fs.writeFileSync(__dirname + "/package.json", Buffer.from(JSON.stringify(sourceObj, null, 2), "utf-8"));
    //fs.writeFileSync(__dirname + "/version.txt", Buffer.from(sourceObj.version, "utf-8"));

    //fs.copyFileSync(__dirname + "/../.npmignore", __dirname + "/.npmignore");
}

function replaceFolder(obj: any, prop: string) {
    if (obj[prop]?.startsWith("dist/")) {
        obj[prop] = obj[prop].slice(5);
    }
}
main();
