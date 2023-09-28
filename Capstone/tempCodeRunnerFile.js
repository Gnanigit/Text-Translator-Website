app.get('/trans/index',function(req,res){
//     //res.send("login")
//     res.sendFile(__dirname+"/public"+"/trans/index.html")
// })
// app.get('/transubmit',function(req,res){

//     db.collection('translation').add({
//         From_langauge:req.query.from_lang,
//         From_text:req.query.to_lang,
//         To_language:req.query.from_text,
//         To_text:req.query.to_text
//     }).then(()=>{
//         res.sendFile(__dirname+"/public"+"/trnas/index.html")
//     });
// })