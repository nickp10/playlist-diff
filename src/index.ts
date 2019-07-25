import "core-js/stable";
import "regenerator-runtime/runtime";
import Diff from "./diff";

(async () => {
    await new Diff().run();
    process.exit();
})();
