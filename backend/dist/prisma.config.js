"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const dbUrl = process.env["DATABASE_URL"];
if (!dbUrl) {
    console.warn("DATABASE_URL not found in environment, using default");
}
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: dbUrl || "postgresql://localhost:5432/garage_db",
    },
});
//# sourceMappingURL=prisma.config.js.map