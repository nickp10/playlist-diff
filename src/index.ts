import "@babel/polyfill";
import Diff from "./diff";

(async () => {
    await new Diff().run();
    process.exit();
})();
