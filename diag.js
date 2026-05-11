const { exec } = require('child_process');
const fs = require('fs');

exec('npx prisma validate', (error, stdout, stderr) => {
    const cleanStderr = stderr.replace(/\u001b\[[0-9;]*m/g, '');
    fs.writeFileSync('clean_error.txt', "STDOUT:\n" + stdout + "\nSTDERR:\n" + cleanStderr);
});
