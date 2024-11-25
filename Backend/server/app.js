const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors"); 
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const PORT = 2048;

connectDB();
app.use(cors());
app.use(express.json());
app.use('/api', newsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
