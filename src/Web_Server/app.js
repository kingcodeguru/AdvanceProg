const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const DB_CONN = process.env.DB_CONN || 'mongodb://localhost:27017/DriveDB';
const PORT = process.env.WEB_PORT || 8080;

// connect to DB
mongoose.connect(DB_CONN);

const app = express();

app.use(cors({
  origin: '*',
  exposedHeaders: ['Location']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

app.use('/api/users', userRoutes); 
app.use('/api/files', fileRoutes); 
app.use('/api/search', searchRoutes); 
app.use('/api/tokens', tokenRoutes);

app.listen(PORT, '0.0.0.0', () => {});