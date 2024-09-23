import { expect } from 'chai';
import { app, getTasks, clearTasks } from '../cli.js';
import mock from 'mock-fs';

describe('Task CLI Tool', () => {
    // Sample tasks data
    const initialTasks = {
        tasks: [
            {
                id: 1,
                description: 'Buy groceries',
                status: 'todo'
            }
        ]
    };

    beforeEach(async () => {
        mock({
            'data/tasks.json': JSON.stringify(initialTasks)
        });
        await clearTasks();
        // Simulate saving initial tasks (mocked operation)
        await app(['list']);
    });

    afterEach(() => {
        mock.restore();
    });

    it('should add a new task', async () => {
        const args = ['add', 'Buy groceries'];
        await app(args);
        const tasks = getTasks();
        expect(tasks).to.have.lengthOf(2);
        expect(tasks[1].description).to.equal('Buy groceries');
        expect(tasks[1].status).to.equal('todo');
    });

    it('should update an existing task', async () => {
        const args = ['update', '1', 'Buy groceries and cook dinner'];
        await app(args);
        const tasks = getTasks();
        expect(tasks[0].description).to.equal('Buy groceries and cook dinner');
    });

    it('should delete a task', async () => {
        const args = ['delete', '1'];
        await app(args);
        const tasks = getTasks();
        expect(tasks).to.have.lengthOf(0);
    });

    it('should mark a task as in-progress', async () => {
        const args = ['mark-in-progress', '1'];
        await app(args);
        const tasks = getTasks();
        expect(tasks[0].status).to.equal('in-progress');
    });

    it('should mark a task as done', async () => {
        const args = ['mark-done', '1'];
        await app(args);
        const tasks = getTasks();
        expect(tasks[0].status).to.equal('done');
    });

    it('should list all tasks', async () => {
        const log = console.log;
        let output = '';
        console.log = (str) => { output += str; };
        await app(['list']);
        expect(output).to.include('[ID: 1] Buy groceries - todo');
        console.log = log;
    });

    it('should list tasks by status', async () => {
        await app(['mark-done', '1']);
        const log = console.log;
        let output = '';
        console.log = (str) => { output += str; };
        await app(['list', 'done']);
        expect(output).to.include('[ID: 1] Buy groceries - done');
        console.log = log;
    });
});