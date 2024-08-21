const express = require('express');
const app = express();
const userRouter = require('./routes/user.route');
const taskRouter = require('./routes/task.route');
const authenticate = require('./middlewares/auth.middleware');
const dotenv = require('dotenv').config();
const connection = require('./config/db');
const PORT = process.env.PORT || 3005;
const cors = require('cors');


// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use('/user', userRouter);
app.use('/task', authenticate, taskRouter);

// Server Check Endpoint
app.get('/', (req, res) => {
    res.send('Server is Running Fine');
});

// Start the Server
app.listen(PORT, async () => {
    try {
        await connection;
        console.log(`Server is Running on Port ${PORT} and Connected to the Database`);
    } catch (error) {
        console.error(`Error Occurred while Connecting to the Database: ${error.message}`);
    }
});
