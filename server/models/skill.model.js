import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Create index for faster queries
skillSchema.index({ name: 1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
