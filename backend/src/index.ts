import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import facilitiesRoutes from './routes/facilities.firebase';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Russian Oil Facilities API',
        version: '1.0.0',
        endpoints: {
            facilities: '/api/facilities'
        }
    });
});

// API routes
app.use('/api/facilities', facilitiesRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});