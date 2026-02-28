export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { runStartupHealthChecks } = await import(
    "./server/infrastructures/startup-health"
  );
  await runStartupHealthChecks();
}
