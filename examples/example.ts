import { generateAvatar } from "../dist/index.js";
import fs from "fs";

const buffer = await generateAvatar("8a2c59cb-5174-4110-8798-061c7e65995c", 400, 400);

fs.writeFileSync("./assets/avatar.png", buffer);
