if(process.env.NODE_ENV!=='Production'){
   require('dotenv').config()
}

const stripeSecretkey= process.env.STRIPE_SECRET_KEY;
const stripePublickey= process.env.STRIPE_PUBLIC_KEY;


const express= require('express')
const app= express()

const fs= require('fs')
const stripe= require('stripe')(stripeSecretkey)

app.set('view engine','ejs')
app.use(express.json())
app.use(express.static('public'))


app.get('/store',function(req,res){
    fs.readFile('items.json',function(error,data){
        if(error){
            res.status(500).end();
        }else{
            res.render('store.ejs',{
                stripePublickey: stripePublickey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase',function(req,res){
    fs.readFile('items.json',function(error,data){
        if(error){
            res.status(500).end();
        }else{
           
            const itemsJson= JSON.parse(data)
            const itemsArray= itemsJson.music.concat(itemsJson.merch)
            let total=0;
            req.body.items.forEach(function(item){
                const itemJson= itemsArray.find(function(i){
                    return i.id==item.id
                })
                total = total + itemJson.price * item.quantity;
            })

            stripe.charges.create({
                amount: total,
                source : req.body.stripeTokenId,
                currency : 'usd'
            }).then(function(){
                console.log("Charge successful")
                res.json({message: 'Successfully purchased items.'})
            }).catch(function(){
                console.log('Charge Fail')
                res.status(500).end()
            })

            
        }
    })
})

const data={
    name:'Neeraj',
    address:{
        flat:123,
        area:'abc'
    },
    age:23
}



app.listen(4000)