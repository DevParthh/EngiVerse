import { CohereClient } from "cohere-ai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new CohereClient({
  token: process.env.COHERE_API_KEY, 
});

export default ai;