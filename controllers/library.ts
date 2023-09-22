import { Request, Response } from "express"
import { Library } from '../models/library'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { auth } from "../service/auth";


dotenv.config();
const SALT_ROUNDS: number = 10;

const libraryLogin = async (req: Request, res: Response)=>{
    try{
        const {email,password} = req.body;
        if(!(email && password)){
            res.status(400).send("All inputs are requred");
        }
        const library = await Library.findOne({lEmail: email});
        if(library && await (bcrypt.compare(password,library.lPassword))){
            console.log("Login successful");
            const token = jwt.sign(
                { user_id: library.lID, email },
                ((process.env.TOKEN_KEY as unknown) as any),
                {
                  expiresIn: "1h",
                });
                library.lToken = token;
                await library.save();
                auth(library.lToken);
                res.status(200).json(library);
        }
        res.status(400).send("Invalid credentials");
    }
    catch (err){
        res.send(err);
    }
}

const librarySignUp = async (req: Request, res: Response) => {
    req.body.lPassword = await bcrypt.hash(req.body.lPassword, SALT_ROUNDS)
    req.body.lID = 'LIB' + uuidv4()
    console.log(req.body)
    const newLibrary = new Library(req.body)
    newLibrary.save().then(() => {
        res.json({ message: "Created successfully" })
    }).catch((err) => {
        res.json({ message: err })
    })
}


export { libraryLogin, librarySignUp }