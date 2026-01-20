// This file is used to generate unique IDs

const crypto = require('crypto');

// public function
const generateId = crypto.randomUUID

// Exporting as an object
module.exports = { generateId };