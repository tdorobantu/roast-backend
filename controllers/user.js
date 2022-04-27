import bcrypt from "bcrypt"
import { getUser } from "../redis/user.js";

export const registerUserAPI = async (req, res) => {
    
    // declare regex patterns for string sanitization and unpack request body
    const blacklistName = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;
    const blacklistEmail = /[` !#$%^&*()_+\-=[\]{};':"\\|,<>/?~]/g;
    const { name, email, password } = req.body
    
    // sanitize req
    const sanitizedName =  name.replace(blacklistName, '')
    const sanitizedEmail = email.replace(blacklistEmail, '') 
    //check if user with email already exists
    const match = await getUser(sanitizedEmail)
   console.log("match >>>", match) 
    // check if user is not blacklisted
    // set user
        // if successful, confirm 
        // else, send error.
    res.status(200).send()
}