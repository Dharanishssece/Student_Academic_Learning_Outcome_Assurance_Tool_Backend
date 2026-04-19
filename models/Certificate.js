const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    studentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName:      { type: String, required: true },
    studentEmail:     { type: String, required: true },
    course:           { type: String, default: '' },
    certificateTitle: { type: String, required: true },
    fileUrl:          { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
