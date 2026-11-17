/**
 * Cross-platform concurrent development runner for MarketBridge (Frontend + Backend)
 */
import { spawn } from "node:child_process";
import path from "node:path";

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("================================================================================");
console.log("Starting MarketBridge Development Environment...");
console.log("Frontend: http://localhost:5173");
console.log("Backend:  http://localhost:4000/api");
console.log("================================================================================\n");

// Start backend
const backend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.resolve(process.cwd(), "backend"),
  stdio: "inherit",
  shell: true,
});

// Start frontend
const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
