const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  cards: [{ id: String, title: String, body: String, action: String, href: String, _id: false }],
  dismissed: { type: [String], default: [] },
  computedAt: Date,
  refreshingUntil: Date,
}, { timestamps: true });
module.exports = mongoose.model('InsightSnapshot', schema);
