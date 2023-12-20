import { exec } from "child_process"

const generatedFile = "src/defaults/_generated.ts"

;(() => {
    exec("git diff --name-only", (error, stdout) => {
        const modifiedFiles = stdout.trim().split(/\r?\n/)

        // check if _generated.ts has been modified by commit-msg hook
        if (modifiedFiles.includes(generatedFile)) {
            // amend the last commit to include the updated _generated.ts
            exec(`git commit --amend -C HEAD -n ${generatedFile}`)
        }
    })
})()
