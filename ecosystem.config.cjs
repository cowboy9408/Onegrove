module.exports = {
  apps: [
    {
      name: "onegrove-admin",
      script: "server.cjs",
      cwd: "/var/webapps/onegrove-admin",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 5173
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5173
      }
    }
  ]
}