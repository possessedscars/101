const {readSession,send}=require('./_session');
module.exports=async function(req,res){const session=readSession(req);if(!session)return send(res,401,{authenticated:false});return send(res,200,{authenticated:true,email:session.email});};
