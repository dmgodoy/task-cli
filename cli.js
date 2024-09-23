import { promises as fs } from 'fs';
import path from 'path';

const TASKS_FILE = path.resolve('data/tasks.json');
let tasks = [];

async function loadTasks() {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        console.log("Read JSON data from file:", parsedData); // Debugging information
        if (!parsedData || !Array.isArray(parsedData.tasks)) {
            throw new Error('Invalid tasks format in tasks.json, expecting an object with a tasks array.');
        }
        tasks = parsedData.tasks;
    } catch (err) {
        if (err.code === 'ENOENT') {
            tasks = [];
        } else {
            console.error('Error reading tasks file:', err);
            throw err;
        }
    }
}

async function saveTasks() {
    try {
        const data = { tasks };
        await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing tasks file:', err);
        throw err;
    }
}

export async function app(args) {
    await loadTasks();

    if (args.length === 0) {
        console.error('No subcommand provided.');
        process.exit(1);
    }

    const subcommand = args[0];
    const subcommandArgs = args.slice(1);

    switch (subcommand) {
        case 'add':
            handleAdd(subcommandArgs);
            break;
        case 'update':
            handleUpdate(subcommandArgs);
            break;
        case 'delete':
            handleDelete(subcommandArgs);
            break;
        case 'mark-in-progress':
            handleMarkInProgress(subcommandArgs);
            break;
        case 'mark-done':
            handleMarkDone(subcommandArgs);
            break;
        case 'list':
            handleList(subcommandArgs);
            break;
        case 'help':
        case '--help':
            displayHelp();
            break;
        default:
            console.error(`Unknown subcommand: ${subcommand}`);
            process.exit(1);
    }

    await saveTasks();
}

function handleAdd(args) {
    const description = args.join(' ');
    const id = tasks.length + 1;
    const task = { id, description, status: 'todo' };
    tasks.push(task);
    console.log(`Task added successfully (ID: ${id})`);
}

function handleUpdate(args) {
    const id = parseInt(args[0], 10);
    const description = args.slice(1).join(' ');
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.description = description;
        console.log(`Task updated successfully (ID: ${id})`);
    } else {
        console.error(`Task not found (ID: ${id})`);
    }
}

function handleDelete(args) {
    const id = parseInt(args[0], 10);
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks.splice(index, 1);
        console.log(`Task deleted successfully (ID: ${id})`);
    } else {
        console.error(`Task not found (ID: ${id})`);
    }
}

function handleMarkInProgress(args) {
    const id = parseInt(args[0], 10);
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.status = 'in-progress';
        console.log(`Task marked as in progress (ID: ${id})`);
    } else {
        console.error(`Task not found (ID: ${id})`);
    }
}

function handleMarkDone(args) {
    const id = parseInt(args[0], 10);
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.status = 'done';
        console.log(`Task marked as done (ID: ${id})`);
    } else {
        console.error(`Task not found (ID: ${id})`);
    }
}

function handleList(args) {
    const status = args[0];
    if (status) {
        const filteredTasks = tasks.filter(task => task.status === status);
        displayTasks(filteredTasks);
    } else {
        displayTasks(tasks);
    }
}

function displayTasks(tasks) {
    if (tasks.length === 0) {
        console.log('No tasks found.');
    } else {
        tasks.forEach(task => {
            console.log(`[ID: ${task.id}] ${task.description} - ${task.status}`);
        });
    }
}

function displayHelp() {
    console.log(`
Task CLI - Command Line Tool for Managing Tasks

Usage:
  task <subcommand> [args]

Subcommands:
  add <description>               Add a new task with the given description.
  update <id> <description>       Update the task with the given ID.
  delete <id>                     Delete the task with the given ID.
  mark-in-progress <id>           Mark the task with the given ID as in progress.
  mark-done <id>                  Mark the task with the given ID as done.
  list [status]                   List all tasks, optionally filtered by status (todo, in-progress, done).
  help, --help                    Display this help message.

Examples:
  task add "Write unit tests"
  task update 1 "Write integration tests"
  task delete 1
  task mark-in-progress 2
  task mark-done 2
  task list
  task list done
    `);
}

// Expose tasks for testing
export function getTasks() {
    return tasks;
}

export function clearTasks() {
    tasks = [];
}