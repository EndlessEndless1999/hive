#! /usr/bin/env node

const {Command} = require("commander");

const figlet = require("figlet");

const fs = require("fs");
// FileSystem
const path = require("path");
// Path 
const { execSync } = require('child_process');
// For getting filepaths

import { number, select, Separator, input } from '@inquirer/prompts';


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


let projects: string | any[] = [];

// In the first line, we import the Figlet module. 
// Next, we invoke the figlet.textSync() method with the string Dir Manager as the argument 
// to turn the text into ASCII Art. Finally, we log the text in the console.




// CLI Commands Start Here.

async function listDirContents(filepath: string) {
  try {
    const files = await fs.promises.readdir(filepath);
    const detailedFilesPromises = files.map(async (file: string) => {
      let fileDetails = await fs.promises.lstat(path.resolve(filepath, file));
      const { size, birthtime } = fileDetails;
      return { filename: file, "size(KB)": size, created_at: birthtime };
    });

    const detailedFiles = await Promise.all(detailedFilesPromises);
    console.table(detailedFiles);

  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}


function createDir(filepath: string) {
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
    console.log("The directory has been created successfully");
  }
}

function createFile(filepath: string) {
  fs.openSync(filepath, "w");
  console.log("An empty file has been created");
}

async function displayMenu(choices: any, message: string){
    const answer = await select({
        message: message,
        choices: choices
    });
    return answer;
}

let menuChoices: any;


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

async function startUp() {
    if (!process.argv.slice(2).length) {
        let result = await displayMenu(menuChoices, 'Make a choice');

        executeOption(result);
    }
}

function executeOption(result: any) {
    switch (result) {
        case 0:
            viewProjects();
            break
        case 1:
            createProject();
            break
        case 2:
            addProject();
            break
    }




}

async function viewProjects() {
    if (projects.length == 0) {
        console.log("You haven't defined any projects.")
        startUp();
        return 
    }
    let choices = [];
    for (let i = 0; i < projects.length; i++) {
        choices.push({
            name: projects[i].name,
            value: i,
            description: `Continue Working on ${projects[i].name}`
        })
    }

    const answer = await select({
            message: "Choose Project",
            choices: choices
        });
    

    let answerObj = {
      name : projects[answer].name,
      path : projects[answer].path
    }

    // Create new Choice List with Options + Pass Answer + FilePath of 


    projectMenu(answerObj)


        
    // Add each project as a choice in a list 


    // Display a list of currently stored projects 

    // Be able to choose one to open 


}

async function projectMenu(project: Object) {
  console.log(project)

  // Change menu choices to 
  const answer = await select({
          message: "Choose Project",
          choices: menuChoices
      });

  console.log(answer)
  
}

function createProject() {
    // Create a new project in a chosen directory


}

async function addProject() {
    const directoryPath = getPath();

    const name = await input({message: "Enter the name of your project"});

    const data = {
      name: name,
      path: directoryPath
    }

    const obj = getJSON();

    obj.projects.push(data);

    setJSON(obj);

    

    startUp();
}

function getPath() {
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



async function initialiseHive() {

  
  const myObject = getJSON();

  menuChoices = myObject.myObject.menuChoices;
  projects = myObject.myObject.projects;


}

function getJSON() {
  var data = fs.readFileSync("data.json");
  var myObject = JSON.parse(data);

  return myObject
}

function setJSON(myObject: any) {
  // STRINGIFY OBJECT 
  const jsonObj = JSON.stringify({myObject}, null, 2);

  fs.writeFileSync('data.json', jsonObj, 'utf8');



  // WRITE TO FILE 
}

initialiseHive();

startUp();