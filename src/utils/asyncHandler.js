const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
    Promise.resolve(requestHandler(req, res, next)).
    catch((error) => next(error))
}}

export {asyncHandler}

// const asyncHandler = () => {} // function
// const asyncHandler = (fn) => { () => {} }    // arrow function inside a callback function -- HOF(accepting fn as an argument and/or returning a func)
// const asyncHandler = (fn) => { async () => {} }  making it async function
// const asyncHandler = (fn) => async () => {}  // removed curly braces to avoid return statement 


// const asyncHandler = (fn) => async (req, res, next) => {  //HOFs - Higher Order Functions
//     try{
//         await fn(req, res, next);
//     }
//     catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }