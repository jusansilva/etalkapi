import mongoose from 'mongoose';

const imgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img: {
    data: String,
    contentType: String
  }
});

const imgModel = mongoose.model('Image', imgSchema);

export default imgModel;