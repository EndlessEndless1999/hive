#! /usr/bin/env node

const {Command} = require("commander");

const figlet = require("figlet");

const fs = require("fs");
// FileSystem
const path = require("path");
// Path 
const { execSync, exec } = require('child_process');
// For getting filepaths

import { number, select, Separator, input } from '@inquirer/prompts';


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
} catch (error) {
  console.error("Error during file open:", error);
}


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
      path : projects[answer].path,
      tracks : projects[answer].tracks,
      index : answer
    }

    // Create new Choice List with Options + Pass Answer + FilePath of 


    projectMenu(answerObj)


        
    // Add each project as a choice in a list 


    // Display a list of currently stored projects 

    // Be able to choose one to open 


}

async function projectMenu(project: { name: any; path?: any; tracks: [{}], index: number }) {
  console.log(project)

  // Change menu choices to 
  const answer = await select({
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

  console.log(answer)

  switch(answer){
        case 0:
            addTrack(project);
            break
        case 1:
            viewTracks(project);
            break
        case 2:
            createTrack(project);
            break
        case 3:
            getData(project);
            break

  }


  
}

async function addTrack(project: { name: any; path?: any; tracks: [{}], index: number}) {
  // Use Get Path to get file to be added to the project object
  // Instantiate New Track Object and add it to the project
  // Return to project menu 
  const filePath = getFilePath();

  if (filePath != null) {
    const trackName = await input({message: "Enter the name of your track."})
    const track = {
      name: trackName,
      path: filePath
    }


    const data = getJSON();


    data.projects[project.index].tracks.push(track);

    setJSON(data);



    // Save Changes to the JSON 

  }

  
}

async function viewTracks(project: { name: any; path?: any; tracks: any;}) {
  console.log(project);
  
  let choices: { name: any; value: any; }[] = []
  for(let i = 0; i < project.tracks.length; i++){
    const track = {
      name: project.tracks[i].name,
      value: project.tracks[i].path
    }

    choices.push(track)

  }


  // Display a list of all tracks in the project
  const answer = await select({
    message: "Choose a Track to Work On.",
    choices: choices
  })

  openFile(answer);
  
  // Display Data for each one 
  // Pressing Enter will open one of these projects and close hive
  
  return answer
}

function openFile(filePath: string) {
  const fullPath = path.resolve(filePath);
  const platform = process.platform;

  let command;

  if (platform === 'darwin') {
    // macOS
    command = `open "${fullPath}"`;
  } else if (platform === 'win32') {
    // Windows
    command = `start "" "${fullPath}"`;
  } else if (platform === 'linux') {
    // Linux (might depend on desktop environment)
    command = `xdg-open "${fullPath}"`;
  } else {
    throw new Error('Unsupported platform: ' + platform);
  }

  exec(command, (err: any) => {
    if (err) {
      console.error('Failed to open file:', err);
    } else {
      console.log('File opened:', fullPath);
    }
  });
}

function createTrack(project: { name: any; path?: any; }) {
  // Get file path of project
  // Create New directory with name via text input 
  // Create new als file in that directory
  // Go back to project menu 
  
}

function getData(project: { name: any; path?: any; }) {
  // Get Metadata about project
  return
}

function createProject() {
    // Create a new project in a chosen directory


}

async function addProject() {
    const directoryPath = getDirectoryPath();

    const name = await input({message: "Enter the name of your project"});

    const data = {
      name: name,
      path: directoryPath,
      tracks: []
    }

    const obj = getJSON();

    obj.projects.push(data);

    setJSON(obj);

    

    startUp();
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

  } catch (error) {
    console.error("File selection canceled or failed:");
    return null;
  }
}



async function initialiseHive() {

  
  const myObject = getJSON();

  menuChoices = myObject.menuChoices;
  projects = myObject.projects;


}

function getJSON() {
  var data = fs.readFileSync("data.json");
  var myObject = JSON.parse(data);

  return myObject
}

function setJSON(myObject: any) {
  // STRINGIFY OBJECT 
  const jsonObj = JSON.stringify(myObject, null, 2);

  fs.writeFileSync('data.json', jsonObj, 'utf8');



  // WRITE TO FILE 
}

initialiseHive();

startUp();