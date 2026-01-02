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

export const createUserProfile = async (user) =>{
    try{
        let profile;
        const profileData = {
            user: user._id,
            name: user.name,
            email: user.email,
        }
        if(user.role === 'club-admin'){
            profileData.collegeName = user.collegeName
            profileData.clubName = user.clubName
            profile = await ClubProfile.create(profileData)
            
        }
        if(user.role === 'company'){
            profileData.organizationName = user.organizationName
            profile = await CompanyProfile.create(profileData)
        }
        if(user.role === 'alumni-individual'){
            profileData.formerInstitution = user.formerInstitution
            profile = await AlumniProfile.create(profileData)
        }
        
        return profile
    }catch(error){
        console.log(error)
    }
}
