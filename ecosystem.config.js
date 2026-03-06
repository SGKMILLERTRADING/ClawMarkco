module.exports = {
    apps: [
        {
            name: "markco_hub",
            script: "./markco_hub.js",
            watch: false,
            max_memory_restart: '1G',
            error_file: "logs/err.log",
            out_file: "logs/out.log",
            log_file: "logs/combined.log",
            time: true,
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            }
        }
    ]
};
