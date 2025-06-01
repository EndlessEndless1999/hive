#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Command } = require("commander");
const figlet = require("figlet");
const fs = require("fs");
// FileSystem
const path = require("path");
// Path 
const { execSync } = require('child_process');
// For getting filepaths
const prompts_1 = require("@inquirer/prompts");
const program = new Command();
program
    .version("1.0.0")
    .description("An example CLI for managing a directory")
    .option("-l, --ls  [value]", "List directory contents")
    .option("-m, --mkdir <value>", "Create a directory")
    .option("-t, --touch <value>", "Create a file")
    .parse(process.argv);
const options = program.opts();
// Gets options from command object 
// Defines Options, Versions
console.log(figlet.textSync("Hive - Audio Cave"));
// In the first line, we import the Figlet module. 
// Next, we invoke the figlet.textSync() method with the string Dir Manager as the argument 
// to turn the text into ASCII Art. Finally, we log the text in the console.
// CLI Commands Start Here.
function listDirContents(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs.promises.readdir(filepath);
            const detailedFilesPromises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                let fileDetails = yield fs.promises.lstat(path.resolve(filepath, file));
                const { size, birthtime } = fileDetails;
                return { filename: file, "size(KB)": size, created_at: birthtime };
            }));
            const detailedFiles = yield Promise.all(detailedFilesPromises);
            console.table(detailedFiles);
        }
        catch (error) {
            console.error("Error occurred while reading the directory!", error);
        }
    });
}
function createDir(filepath) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
        console.log("The directory has been created successfully");
    }
}
function createFile(filepath) {
    fs.openSync(filepath, "w");
    console.log("An empty file has been created");
}
function displayMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.select)({
            message: 'Make a choice',
            choices: [
                {
                    name: 'Select Project',
                    value: 0,
                    description: 'Continue Working on a Project',
                },
                {
                    name: 'Create Project',
                    value: 1,
                    description: 'Start a New Project',
                },
                {
                    name: 'Add Project',
                    value: 2,
                    description: 'Add Existing Project to Hive',
                },
            ],
        });
        return answer;
    });
}
if (options.ls) {
    const filepath = typeof options.ls === "string" ? options.ls : __dirname;
    listDirContents(filepath);
}
if (options.mkdir) {
    createDir(path.resolve(__dirname, options.mkdir));
}
if (options.touch) {
    createFile(path.resolve(__dirname, options.touch));
}
function startUp() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.argv.slice(2).length) {
            let result = yield displayMenu();
            executeOption(result);
        }
    });
}
function executeOption(result) {
    switch (result) {
        case 0:
            viewProjects();
        case 1:
            createProject();
        case 2:
            addProject();
    }
}
function viewProjects() {
    // Display a list of currently stored projects 
    // Be able to choose one to open 
}
function createProject() {
    // Create a new project in a chosen directory 
}
function addProject() {
    try {
        const script = `
      set chosenFolder to POSIX path of (choose folder with prompt "Select a directory")
      return chosenFolder
    `;
        const result = execSync(`osascript -e '${script}'`, { encoding: 'utf8' });
        const directoryPath = result.trim();
        console.log("Selected directory:", directoryPath);
        return directoryPath;
    }
    catch (error) {
        console.error("Directory selection canceled or failed:");
        return null;
    }
}
function initialiseHive() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
startUp();
initialiseHive();
//# sourceMappingURL=index.js.map