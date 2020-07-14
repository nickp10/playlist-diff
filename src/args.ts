import * as argv from "argv";

class Args {
    cookie: string;
    input: string[];

    constructor() {
        const args = argv
            .option({ name: "cookie", short: "c", type: "string" })
            .option({ name: "input", short: "i", type: "list,string" })
            .run();
        this.cookie = args.options["cookie"];
        this.input = args.options["input"];
        this.validate();
    }

    validate(): void {
        if (!this.cookie) {
            console.error("The -c or --cookie argument must be supplied.");
            process.exit();
        }
        if (!Array.isArray(this.input)) {
            this.input = [];
        }
    }
}

const args: Args = new Args();
export = args;
