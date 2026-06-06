import { IUser } from "../interfaces/user.interface";
import { availabilityEnum } from "../enums/availability.enum";
import { HydratedDocument, Types } from "mongoose";
export const getAvailability = (user: HydratedDocument<IUser>) => {
  return [
    { availability: availabilityEnum.PUBLIC },
    { availability: availabilityEnum.PRIVATE, createdBy: user._id },
    {
      availability: availabilityEnum.FRIENDS,
      createdBy: {
        $in: [user._id, ...((user.friends as Types.ObjectId[]) || [])],
      },
    },
    { tags: { $in: [user._id] } },
  ];
};
