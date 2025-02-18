const express = require('express');
const sql = require('mssql/msnodesqlv8'); // Use msnodesqlv8 driver
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 1969;

// Function to parse connection string
const parseConnectionString = (connectionString) => {
    const config = {
        server: connectionString.split('DataSource=')[1]?.split(';')[0] || null,
        database: connectionString.split('Database=')[1]?.split(';')[0] || null,
        user: connectionString.split('User Id=')[1]?.split(';')[0] || null,
        password: connectionString.split('Password=')[1]?.split(';')[0] || null,
        options: {
            encrypt: connectionString.includes('Encrypt=true'),
            trustServerCertificate: connectionString.includes('TrustServerCertificate=true'),
            trustedConnection: connectionString.includes('Trusted_Connection=true') || 
                              connectionString.includes('Integrated Security=true'),
        },
        driver: 'msnodesqlv8',
    };
    return config;
};

app.post('/connect', async (req, res) => {
    const { connectionString } = req.body;

    if (!connectionString) {
        return res.status(400).json({ error: 'Connection string is required' });
    }

    const config = parseConnectionString(connectionString);

    if (!config.server || !config.database) {
        return res.status(400).json({ error: 'Invalid connection string' });
    }

    try {
        // Connect to the database
        await sql.connect({
            server: config.server,
            database: config.database,
            user: config.user,
            password: config.password,
            options: {
                encrypt: config.options.encrypt,
                trustServerCertificate: config.options.trustServerCertificate,
                trustedConnection: config.options.trustedConnection,
            },
            driver: 'msnodesqlv8', // Required for Windows Authentication
        });

        // Test the connection
        const result = await sql.query`SELECT 1 AS Test`;
        if (result.recordset[0].Test === 1) {
            res.status(200).json({ message: 'Connected to the database successfully' });
        } else {
            res.status(500).json({ error: 'Failed to verify connection' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to connect to the database' });
    } finally {
        // Close the connection
        await sql.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});