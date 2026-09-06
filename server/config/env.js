// Resolve from this file so startup and seeding work from any directory.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), quiet: true });
