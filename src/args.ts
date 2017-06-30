import * as argv from "argv";
import * as Utils from "./utils";

class Args {
	androidId: string;
	token: string;
	input: string[];

	constructor() {
		const args = argv
			.option({ name: "androidId", short: "a", type: "string" })
			.option({ name: "token", short: "t", type: "string" })
			.option({ name: "input", short: "i", type: "list,string" })
			.run();
		this.androidId = args.options["androidId"];
		this.token = args.options["token"];
		this.input = args.options["input"];
		this.validate();
	}

	validate(): void {
		if (!this.androidId) {
			console.error("The -a or --androidId argument must be supplied.");
			process.exit();
		}
		if (!this.token) {
			console.error("The -t or --token argument must be supplied.");
			process.exit();
		}
		if (!Array.isArray(this.input)) {
			this.input = [];
		}
	}
}

const args: Args = new Args();
export = args;
