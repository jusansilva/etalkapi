import mongoose from 'mongoose';

const imgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img: {
    data: String,
    contentType: String
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const imgModel = mongoose.model('Image', imgSchema);

export default imgModel;