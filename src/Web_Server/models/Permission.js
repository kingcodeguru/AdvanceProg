const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    pid: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    fid: { type: String, required: true }
});

module.exports = mongoose.model('Permission', UserSchema);