import mongoose from "mongoose";

const clubProfileSchemna = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
            unique:true
        },
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            requied:true,
            unique:true
        },
        clubName:{
            type: String,
            required: true,
        },
        collegeName:{
            type:String,
            required:true
        },
        events:[{
            event:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Event",
                required:true
            }
        }],
        phone: {
            type: String,
        },
        logoUrl: {
            type: String,
        },
        description: {
            type: String,
        }

    },
    {
        timestamps: true
    }
) 


const ClubProfile = mongoose.model("ClubProfile", clubProfileSchemna)

export default ClubProfile