import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

// Keep the adapter from recursively invoking the package-level hosting build.
config.buildCommand = "npm run build:next";

export default config;
