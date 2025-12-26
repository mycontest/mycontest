// ================================================================
// MYCONTEST PLATFORM - SERVER
// Server startup and configuration
// ================================================================

require('dotenv').config({ path: '../.env' });

const createApp = require('./app');

// ================================================================
// START SERVER
// ================================================================

const app = createApp();
const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
    console.log(`✓ Server running on ${process.env.DOMAIN || 'http://localhost:' + PORT}`);
});
