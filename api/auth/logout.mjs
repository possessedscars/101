const {clearSession,send}=require('./_session');
module.exports=async function(req,res){if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});clearSession(res);return send(res,200,{ok:true});};
