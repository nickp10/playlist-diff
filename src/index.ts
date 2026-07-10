import "core-js/stable";
import "regenerator-runtime/runtime";
import Menu from "./menu";

(async () => {
    await new Menu().showMenu();
    process.exit();
})();
