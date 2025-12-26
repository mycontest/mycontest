// ================================================================
// MYCONTEST PLATFORM - SERVER
// Server startup and configuration
// ================================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const createApp = require('./app');

// ================================================================
// START SERVER
// ================================================================

const app = createApp();
const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.DOMAIN || `http://localhost:${PORT}`}`);
});
