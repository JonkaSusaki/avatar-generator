import { generateAvatar } from "../dist/index.js";
import fs from "fs";

const buffer = await generateAvatar("asdasdasdasdasd", 400, 400);

fs.writeFileSync("./assets/avatar.png", buffer);
