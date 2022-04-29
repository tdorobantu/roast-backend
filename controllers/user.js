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
    try { 
    const emailMatches = await getUser(sanitizedEmail)
        if(emailMatches === 1) {
            res.status(400).send({
                email: "",
                password: "",
                name: "",
                server: "A user with the same email address already exists! Try forgot password to reset password",
              })
        } else if (
            emailMatches > 1
        ) {
            res.status(500).send({
                email: "",
                password: "",
                name: "",
                server: "Multiple user with the same email address already exists! Contact Admin!",
              })
        }
    } catch (error) {
        console.error(error)
        res.status(500).send({
            email: "",
            password: "",
            name: "",
            server: "Redis db unavailable. Contact Admin!",
          })
    }
    // Register user
    
        // if successful, confirm 
        // else, send error.
    res.status(200).send()
}