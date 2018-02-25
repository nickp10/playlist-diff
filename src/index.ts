#! /usr/bin/env node

import Diff from "./diff";

(async () => {
    await new Diff().run();
})();
