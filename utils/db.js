import mongoose from 'mongoose';
import User from '@/dbmodels/usermodel'; // Assuming the Profile model is in this path
import Connect from '@/dbconfig/connect';

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function getProfiles(search, offset = 0) {
  const query = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
    : {};

  const profiles = await User.find(query).skip(offset).limit(5).exec();
  const totalProfiles = await User.countDocuments(query).exec();

  const newOffset = profiles.length >= 5 ? offset + 5 : null;

  return {
    profiles,
    newOffset,
    totalProfiles,
  };
}

export async function getOwners(search, offset = 0) {
  await Connect();

  const query = search
   

  // Fetch recruiters based on the query with pagination
  const owners = await User.find(query).skip(offset).limit(5).exec();
  const totalOwners = await User.countDocuments(query).exec();

  // Calculate the new offset
  const newOffset = owners.length >= 5 ? offset + 5 : null;

  return {
    owners,
    newOffset,
    totalOwners,
  };
}