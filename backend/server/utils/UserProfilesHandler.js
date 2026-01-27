import ClubProfile from "../models/ClubProfile.js";
import CompanyProfile from "../models/CompanyProfile.js";
import AlumniProfile from "../models/AlumniProfile.js";

export const getUserProfile = async (user) => {
    let profile;
    if (user.role === 'club-admin') profile = await ClubProfile.findOne({ user: user._id });
    if (user.role === 'company') profile = await CompanyProfile.findOne({ user: user._id });
    if (user.role === 'alumni-individual') profile = await AlumniProfile.findOne({ user: user._id });
    console.log(profile)
    return profile;
}

export const createUserProfile = async (userData, userId) => {
    try {
        console.log("Creating user profile for:", userId);
        console.log("UserData received:", JSON.stringify(userData, null, 2));

        let profile;
        const profileData = {
            user: userId || userData._id,
            name: userData.name,
            email: userData.email,
        }
        if (userData.role === 'club-admin') {
            profileData.collegeName = userData.collegeName
            profileData.clubName = userData.clubName
            profile = await ClubProfile.create(profileData)

        }
        if (userData.role === 'company') {
            profileData.organizationName = userData.organizationName
            profile = await CompanyProfile.create(profileData)
        }
        if (userData.role === 'alumni-individual') {
            profileData.formerInstitution = userData.formerInstitution
            profile = await AlumniProfile.create(profileData)
        }
        console.log(profile)

        return profile
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
}
