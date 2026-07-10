import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import Diff from './diff';
import Search from './search';

export default class Menu {
    async showMenu() {
        const rl = readline.createInterface({ input, output });
        let keepRunning = true;

        while (keepRunning) {
            console.log('=== MAIN MENU ===');
            console.log('1. Perform Diff');
            console.log('2. Search');
            console.log('3. Exit');
            console.log('=================');

            const selection = await rl.question('Select an option: ');
            switch (selection.trim()) {
                case '1':
                    await new Diff().run(rl);
                    break;
                case '2':
                    await new Search().run(rl);
                    break;
                case '3':
                    console.log('Exiting...');
                    keepRunning = false;
                    rl.close();
                    break;
                default:
                    console.log('Invalid selection. Please try again.');
                    break;
            }
        }
    }
}