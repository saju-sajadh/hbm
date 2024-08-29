import mongoose from 'mongoose'

const placeSchema = new mongoose.Schema({
  owner: String,
  title:String,
  address:String,
  photos:[String],
  description:String,
  features:[String],
  extrainfo:String,
  checkin:String,
  checkout:String,
  maxguest:Number,
  price:Number
});

const Place = mongoose.models.place || mongoose.model('place',placeSchema);

module.exports = Place;