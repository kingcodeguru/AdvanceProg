const mongoose = require('mongoose');

const FileDirSchema = new mongoose.Schema({
    fid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    is_file: { type: Boolean, required: true },
    type: { type: String, required: true },
    parent_id: { type: String, default: null },
    trashed: { type: Boolean, default: false },

    creation_date: { type: Date, default: Date.now },
    last_modified: { type: Date, default: Date.now },
    last_viewed: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileDir', FileDirSchema);