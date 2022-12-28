import { Types } from 'mongoose';

import { CommunityModel } from '../../models';

export async function getCommunityById(id: Types.ObjectId) {
  return await CommunityModel.findById(id);
}
