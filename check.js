const { exec } = require('child_process');
exec('npx prisma generate', (error, stdout, stderr) => {
  console.log("=== STDOUT ===");
  console.log(stdout);
  console.log("=== STDERR ===");
  console.log(stderr);
  if (error) console.log("=== ERROR ===\n", error.message);
});
