const express = require('express');
const app = express();
const env = require('./config/environment')
const cors = require('cors');
// console.log("env",env)
const PORT = env.port;
app.use(cors({ origin: '*' }));
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));

app.get('/', (req, res) => {
    res.send('Request Management App Backend is Running!');
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
