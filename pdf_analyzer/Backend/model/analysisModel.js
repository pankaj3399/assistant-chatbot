import mongoose from "mongoose"

const analysisSchema = new mongoose.Schema({
    pdfData:{type:[String], required: true},
    userId:{type:mongoose.Types.ObjectId, ref:"User"},
    name:{type:String, required:true},
    createdAt:{type:String, default: Date.now()},
    response:{type:String, required:true}
})

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis