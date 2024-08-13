import express from "express";
import dotenv from "dotenv";

// configures dotenv to work in your application
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.get("/", (request, response) => { 
  response.status(200).send("Hello World");
}); 

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT || 3000); 
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});
