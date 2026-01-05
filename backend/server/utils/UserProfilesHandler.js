import ClubProfile from "../models/ClubProfile.js";
import CompanyProfile from "../models/CompanyProfile.js";
import AlumniProfile from "../models/AlumniProfile.js";

export const getUserProfile = async (user) => {
    let profile;
    if(user.role === 'club-admin') profile = await ClubProfile.findById(user.profile);
    if(user.role === 'company') profile = await CompanyProfile.findById(user.profile);
    if(user.role === 'alumni-individual') profile = await AlumniProfile.findById(user.profile);
    return profile;
}

export const createUserProfile = async (pendingUser, user) =>{
    try{
        let profile;
        const profileData = {  
            user: user._id,
            name: pendingUser.name,
            email: pendingUser.email,
        }
        if(pendingUser.role === 'club-admin'){
            profileData.collegeName = pendingUser.collegeName
            profileData.clubName = pendingUser.clubName
            profile = await ClubProfile.create(profileData)
            
        }
        if(pendingUser.role === 'company'){
            profileData.organizationName = pendingUser.organizationName
            profile = await CompanyProfile.create(profileData)
        }
        if(pendingUser.role === 'alumni-individual'){
            profileData.formerInstitution = pendingUser.formerInstitution
            profile = await AlumniProfile.create(profileData)
        }
        console.log(profile)
        return profile
    }catch(error){
        console.log(error)
    }
}
