import { Types } from 'mongoose';

import { Roles } from '../../globals';
import { UserModel } from '../../models';

export async function getUserById(id: Types.ObjectId) {
  return await UserModel.findById(id);
}

export async function getAllModeratorsAndSuperModerators(): Promise<string[]> {
  let moderatorEmailAddresses: string[] = [];

  try {
    // This find can be converted into a cursor-pagination loop query to support 
    // large amount of users (see the commented function below)
    const allModerators = await UserModel.find({ 
        role: { $in: [Roles.MODERATOR, Roles.SUPER_MODERATOR] },
        email: { $exists: true } 
    });

    moderatorEmailAddresses = allModerators.filter((moderator) => moderator.email).map((moderator) => moderator.email!);

    return moderatorEmailAddresses;
  } catch (err) {
    console.error('Error when trying to get all moderators and super moderators from DB', err);
  }

  return moderatorEmailAddresses;
}

// const PAGE_SIZE = 10; // Can be configured

// async function getAllModerators (pageSize = PAGE_SIZE) {
//   let allModerators = []; // Array to store the results of all pages
//   let startingAfter: Types.ObjectId | null = null; // _id of the last document in the previous page

//   // Set a flag to track when there are no more pages to return
//   let morePagesLeft = true;

//   while (morePagesLeft) {
//     // Query for the next page of moderators
//     const moderators = await UserModel.find({ 
//             role: { $in: [Roles.MODERATOR, Roles.SUPER_MODERATOR] },
//             email: { $exists: true },
//             _id: { $gt: startingAfter } // Only return documents with _id greater than the startingAfter value
//         })
//         .sort({ _id: 1 }) // Sort the documents by _id in ascending order
//         .limit(pageSize) // Limit the number of documents returned

//     // If there are no more documents in the query result, set the 'morePagesLeft' flag to `false`
//     if (moderators.length === 0) {
//       morePagesLeft = false;
//     } else {
//       // Update the startingAfter value with the _id of the last document in the page
//       startingAfter = moderators[moderators.length - 1]._id;

//       // Add the page of moderators to the allModerators array
//       allModerators = allModerators.concat(moderators);
//     }
//   }

//   return allModerators;
// }
