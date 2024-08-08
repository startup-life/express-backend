jest.mock('./app', () => {
    const express = require('express');
    const app = express();
    app.use(express.json());
    app.post('/users/login', (req, res) => {
        if (!req.body.email) {
            return res
                .status(400)
                .json({ error: { message: 'required_email' } });
        }
        res.status(200).json({ success: true });
    });

    return {
        app,
        initSessionId: jest.fn().mockImplementation(() => {
            console.log('Mocked initSessionId called');
            return Promise.resolve();
        }),
        startHttpServer: jest.fn().mockImplementation((port) => {
            const server = app.listen(port, () => {
                console.log(`Mocked server listening on port ${port}`);
            });
            return server;
        }),
        startHttpsServer: jest.fn().mockImplementation((port) => {
            const server = app.listen(port, () => {
                console.log(`Mocked server listening on port ${port}`);
            });
            return server;
        })
    };
});
