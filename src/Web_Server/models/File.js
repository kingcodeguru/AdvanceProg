const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    is_file: { type: Boolean, required: true },
    type: { type: String, required: true },
    parent_id: { type: String, default: null }
});

module.exports = mongoose.model('File', UserSchema);