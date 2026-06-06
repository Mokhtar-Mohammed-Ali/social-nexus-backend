"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = void 0;
const availability_enum_1 = require("../enums/availability.enum");
const getAvailability = (user) => {
    return [
        { availability: availability_enum_1.availabilityEnum.PUBLIC },
        { availability: availability_enum_1.availabilityEnum.PRIVATE, createdBy: user._id },
        {
            availability: availability_enum_1.availabilityEnum.FRIENDS,
            createdBy: {
                $in: [user._id, ...(user.friends || [])],
            },
        },
        { tags: { $in: [user._id] } },
    ];
};
exports.getAvailability = getAvailability;
