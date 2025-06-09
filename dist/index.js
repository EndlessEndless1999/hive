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
const { execSync, exec } = require('child_process');
// For getting filepaths
const prompts_1 = require("@inquirer/prompts");
const program = new Command();
program
    .version("1.0.0")
    .description("An example CLI for managing a directory")
    .option("-l, --ls  [value]", "List directory contents")
    .option("-m, --mkdir <value>", "Create a directory")
    .option("-t, --touch <value>", "Create a file")
    .option("-o, --open <value>", "Open a File")
    .parse(process.argv);
const options = program.opts();
// Gets options from command object 
// Defines Options, Versions
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
try {
    const entry = options.open.trim(); // trim user input
    console.log("Looking for entry:", entry);
    const data = getJSON();
    for (let i = 0; i < data.projects.length; i++) {
        const tracks = data.projects[i].tracks;
        for (let k = 0; k < tracks.length; k++) {
            const track = tracks[k];
            const trackName = track.name.trim(); // normalize JSON value
            console.log(`Checking track: '${trackName}'`);
            if (entry === trackName) {
                console.log("Match found! Opening:", track.path);
                openFile(track.path);
                /// THIS DOESN'T EXIT THE FOR LOOP WHEN IT FINDS THE TRACK
                /// EXTRACT IT INTO A FUNCTION
            }
        }
    }
    console.log("No matching track found.");
}
catch (error) {
    console.error("Error during file open:", error);
}
console.log(figlet.textSync("Hive - Audio Cave"));
let projects = [];
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
    else {
        console.log("Folder not created" + " " + filepath);
    }
}
function createFile(filepath) {
    fs.openSync(filepath, "w");
    console.log("An empty file has been created");
}
function displayMenu(choices, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.select)({
            message: message,
            choices: choices
        });
        return answer;
    });
}
let menuChoices;
function startUp() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.argv.slice(2).length) {
            let result = yield displayMenu(menuChoices, 'Make a choice');
            executeOption(result);
        }
    });
}
function executeOption(result) {
    switch (result) {
        case 0:
            viewProjects();
            break;
        case 1:
            createProject();
            break;
        case 2:
            addProject();
            break;
    }
}
function viewProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        if (projects.length == 0) {
            console.log("You haven't defined any projects.");
            startUp();
            return;
        }
        let choices = [];
        for (let i = 0; i < projects.length; i++) {
            choices.push({
                name: projects[i].name,
                value: i,
                description: `Continue Working on ${projects[i].name}`
            });
        }
        const answer = yield (0, prompts_1.select)({
            message: "Choose Project",
            choices: choices
        });
        let answerObj = {
            name: projects[answer].name,
            path: projects[answer].path,
            tracks: projects[answer].tracks,
            index: answer
        };
        // Create new Choice List with Options + Pass Answer + FilePath of 
        projectMenu(answerObj);
        // Add each project as a choice in a list 
        // Display a list of currently stored projects 
        // Be able to choose one to open 
    });
}
function projectMenu(project) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(project);
        // Change menu choices to 
        const answer = yield (0, prompts_1.select)({
            message: `Currently viewing options for ${project.name}`,
            choices: [
                {
                    name: "AddTrack",
                    value: 0,
                    description: "Add track to project"
                },
                {
                    name: "ViewTracks",
                    value: 1,
                    description: "View tracks in project"
                },
                {
                    name: "CreateTrack",
                    value: 2,
                    description: "Create a New Track"
                },
                {
                    name: "GetData",
                    value: 3,
                    description: "View data about project"
                }
            ]
        });
        console.log(answer);
        switch (answer) {
            case 0:
                addTrack(project);
                break;
            case 1:
                viewTracks(project);
                break;
            case 2:
                createTrack(project);
                break;
            case 3:
                getData(project);
                break;
        }
    });
}
function addTrack(project) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use Get Path to get file to be added to the project object
        // Instantiate New Track Object and add it to the project
        // Return to project menu 
        const filePath = getFilePath();
        if (filePath != null) {
            const trackName = yield (0, prompts_1.input)({ message: "Enter the name of your track." });
            const track = {
                name: trackName,
                path: filePath
            };
            const data = getJSON();
            data.projects[project.index].tracks.push(track);
            setJSON(data);
            // Save Changes to the JSON 
        }
    });
}
function viewTracks(project) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(project);
        let choices = [];
        for (let i = 0; i < project.tracks.length; i++) {
            const track = {
                name: project.tracks[i].name,
                value: project.tracks[i].path
            };
            choices.push(track);
        }
        // Display a list of all tracks in the project
        const answer = yield (0, prompts_1.select)({
            message: "Choose a Track to Work On.",
            choices: choices
        });
        openFile(answer);
        // Display Data for each one 
        // Pressing Enter will open one of these projects and close hive
        return answer;
    });
}
function openFile(filePath) {
    const fullPath = path.resolve(filePath);
    const platform = process.platform;
    let command;
    if (platform === 'darwin') {
        // macOS
        command = `open "${fullPath}"`;
    }
    else if (platform === 'win32') {
        // Windows
        command = `start "" "${fullPath}"`;
    }
    else if (platform === 'linux') {
        // Linux (might depend on desktop environment)
        command = `xdg-open "${fullPath}"`;
    }
    else {
        throw new Error('Unsupported platform: ' + platform);
    }
    exec(command, (err) => {
        if (err) {
            console.error('Failed to open file:', err);
        }
        else {
            console.log('File opened:', fullPath);
        }
    });
}
function createTrack(project) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get file path of project
        const name = yield (0, prompts_1.input)({ message: "Enter the name of your track." });
        // Create New directory with name via text input 
        createDir(project.path + name);
        // Create new als file in that directory
        createFile(project.path + name + "/" + name + ".als");
        const track = {
            name: name,
            path: project.path + name + "/" + name + ".als"
        };
        const data = yield getJSON();
        data.projects[project.index].tracks.push(track);
        setJSON(data);
        // Push to persistent data
    });
}
function getData(project) {
    // Get Metadata about project
    return;
}
function createProject() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a new project in a chosen directory
        console.log("Choose where you want the new project to go.");
        const path = getDirectoryPath();
        console.log("Enter the name of your project");
        const name = yield (0, prompts_1.input)({ message: "Enter the name of your new project." });
        createDir(path + name);
        const project = {
            name: name,
            path: path + name + "/",
            tracks: []
        };
        const data = yield getJSON();
        data.projects.push(project);
        setJSON(data);
    });
}
function addProject() {
    return __awaiter(this, void 0, void 0, function* () {
        const directoryPath = getDirectoryPath();
        const name = yield (0, prompts_1.input)({ message: "Enter the name of your project" });
        const data = {
            name: name,
            path: directoryPath,
            tracks: []
        };
        const obj = getJSON();
        obj.projects.push(data);
        setJSON(obj);
        startUp();
    });
}
function getDirectoryPath() {
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
    // uses apple script to open a dialog box to select a directory
}
function getFilePath() {
    try {
        const script = 'set chosenFile to POSIX path of (choose file with prompt "Select a file")';
        const result = execSync(`osascript -e '${script}' -e 'return chosenFile'`, { encoding: 'utf8' });
        const filePath = result.trim();
        console.log("Selected file:", filePath);
        return filePath;
    }
    catch (error) {
        console.error("File selection canceled or failed:");
        return null;
    }
}
function initialiseHive() {
    return __awaiter(this, void 0, void 0, function* () {
        const myObject = getJSON();
        menuChoices = myObject.menuChoices;
        projects = myObject.projects;
    });
}
function getJSON() {
    var data = fs.readFileSync("data.json");
    var myObject = JSON.parse(data);
    return myObject;
}
function setJSON(myObject) {
    // STRINGIFY OBJECT 
    const jsonObj = JSON.stringify(myObject, null, 2);
    fs.writeFileSync('data.json', jsonObj, 'utf8');
    // WRITE TO FILE 
}
initialiseHive();
startUp();
//# sourceMappingURL=index.js.map