/// <reference path="../typings/index.d.ts" />

import * as argv from "argv";
import * as Utils from "./utils";

class Args {
	email: string;
	password: string;
	input: string[];

	constructor() {
		const args = argv
			.option({ name: "email", short: "e", type: "string" })
			.option({ name: "password", short: "p", type: "string" })
			.option({ name: "input", short: "i", type: "list,string" })
			.run();
		this.email = args.options["email"];
		this.password = args.options["password"];
		this.input = args.options["input"];
		this.validate();
	}

	validate(): void {
		if (!this.email) {
			console.error("The -e or --email argument must be supplied.");
			process.exit();
		}
		if (!this.password) {
			console.error("The -p or --password argument must be supplied.");
			process.exit();
		}
		if (!Array.isArray(this.input)) {
			this.input = [];
		}
	}
}

const args: Args = new Args();
export = args;
