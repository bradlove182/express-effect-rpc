import { recommended } from "@effect/tsgo/oxlint-presets"
import { defineConfig } from "oxlint"

export default defineConfig({
    extends: [recommended],
    plugins: ["eslint", "effecttsgo", "import", "jsx-a11y", "node", "oxc", "typescript", "unicorn"],
    options: {
        typeAware: true,
        typeCheck: true,
    },
})
