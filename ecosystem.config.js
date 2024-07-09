module.exports = {
    apps: [
        {
            name: 'node-community-api',
            script: './app.js',
            exec_mode: 'cluster',
            instances: 'max',
            user: 'ubuntu', // Node.js 프로세스를 실행할 사용자
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
