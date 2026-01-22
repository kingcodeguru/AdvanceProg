const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    creation_date: { type: Date, default: Date.now },
    avatar: { type: String },
    password: { type: String, required: true },
    starred_files: [{ type: String, ref: 'FileDir' }, { default: [] }]
});

module.exports = mongoose.model('User', UserSchema);