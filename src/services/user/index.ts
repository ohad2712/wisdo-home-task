import { Roles } from "../../globals";
import { UserModel } from "../../models";

export async function getAllModeratorsAndSuperModerators(): Promise<string[]> {
  let moderatorEmailAddresses: string[] = [];

  try {
    // TODO: Move this query to a dedicated User service
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
