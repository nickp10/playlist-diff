import * as argv from "argv";

class Args {
    input: string[];

    constructor() {
        const args = argv
            .option({ name: "input", short: "i", type: "list,string" })
            .run();
        this.input = args.options["input"];
        this.validate();
    }

    validate(): void {
        if (!Array.isArray(this.input)) {
            this.input = [];
        }
    }
}

const args: Args = new Args();
export = args;
