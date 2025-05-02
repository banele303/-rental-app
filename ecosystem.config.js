MediaSourceHandle.export = {
  apps: [
    {
      name: "project-management",
      script: "npm",
      args: "run dev",
      env: {
        NOVE_ENV: "development",
      },
    },
  ],
};
