const {readSession,send}=require('../auth/_session');
module.exports=async function(req,res){const session=readSession(req);if(!session)return send(res,401,{error:'Não autenticado.'});return send(res,200,{stats:{orders:0,bracelets:0,paid:0,events:0},orders:[],events:[]});};
