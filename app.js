
// Require modules
const express    = require('express');
const bodyParser = require('body-parser');
const mysql      = require('mysql');
const path       = require('path');
const ejs        = require("ejs");
const app        = express();
const multer     = require('multer');
const cookParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/views')));

// uploaded file 
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null,Date.now() +'-'+file.originalname)
    }
});
let upload = multer({storage: storage});

// Register handlebars with the express app.
app.set('view engine', 'ejs');

// Set port for server
var port = process.env.PORT || 3000;
// Make server listen to port
app.listen(port,()=>{
    console.log("server is running on port : " + port);
});

// Mysql connection

let connection = mysql.createConnection({
    connectionLimit : 10,
    aquireTimeOut: 120000,
    host : '139.162.172.118',
    user : 'chatgram_myuser',
    password : 'm*0cn9G4D?PK',
    database : 'chatgram_food_delivery_system'
});


// Set route for login page
app.get('/log',(req,res)=>{
   res.render("pages/login.ejs",{
       name:"test"
   });
});

// Set route for register page
app.get('/register',(req,res)=>{
    res.render("pages/register.ejs",{
        name:"test"
    });
 });

// Set route for register page
app.post('/register',upload.single('agentImage'),(req,res)=>{
    let agent_type = req.body.agentType;
    let agent_name = req.body.agentName;
    let agent_phone = req.body.agentPhone;
    let agent_email = req.body.agentEmail;
    let agent_password = req.body.agentPassword;
    let agent_address = req.body.agentAddress;
    let agent_image = req.file.filename;
    let agent_description = req.body.agentDescription;

    connection.query('CALL RegisterAgent(?,?,?,?,?,?,?,?)',
    [agent_type,agent_name,agent_phone,agent_email,agent_password,agent_address,agent_image,agent_description],
    (error,result)=>{
        res.redirect("/log")
        });
 });

// Set route for login page
app.post('/login',(req,res)=>{
    let email = req.body.agentEmail;
    let password = req.body.agentPassword;

    connection.query("select * from agent where agent_email = ? and password = ?",[email,password],(error,result)=>{
        if(result.length > 0) {
           res.cookie('login','correct');
           res.cookie('name',result[0].agent_name);
           res.redirect("/?agent_id=" + result[0].uuid);
        } else {
            res.redirect("/log")
        }
   });
});

app.get('/login',(req,res)=>{
    res.render("pages/login.ejs",{
        name:"test"
    });
 });

// Set route for dashboard
app.get('/',(req,res)=>{
    let agent_id = "0b4328a8-26e0-11e9-8df0-f23c91f3c86e" ;

        connection.query('CALL GetDashboardInfo(?);',[agent_id],(error,results)=>{
            
            res.render("index",{
                customerCount: results[0][0].customerCount,
                deliverd: results[1][0].deliverd,
                suspended: results[2][0].suspended,
                sales: results[3][0].sales,
                orders: results[4]
        });
    });
    
});

// Set route for get all items of specific agent
app.get('/items',(req,res)=>{
    let agent_id =  "0b4328a8-26e0-11e9-8df0-f23c91f3c86e";//req.params.agent_id;
    connection.query('CALL GetAllItems(?)',[agent_id],(error,results)=>{
        res.render('pages/items.ejs',{
            items: results[0]
        });
    });

});


// Set route for add item in database
app.post('/items/insert',upload.single('addItemImage'),(req,res)=>{

    let agent_id = "0b4328a8-26e0-11e9-8df0-f23c91f3c86e";
    let category_id = req.body.addItemCategory;
    let item_name = req.body.addItemName;
    let item_price = req.body.addItemPrice;
    let item_description = req.body.addItemDescription;
    let item_image = req.file.filename;

    connection.query('CALL InsertItem(?,?,?,?,?,?)',
    [agent_id,item_name,item_price,item_description,item_image,category_id],(error,results)=>{
        res.redirect("/items");
    });

});

// Set route for edit item
app.get('/items/:item_id',(req,res)=>{

    let item_id = req.params.item_id;
    let agent_id = "d8b17838-231f-11e9-8df0-f23c91f3c86e";
    connection.query('CALL GetItem(?,?)',[item_id,agent_id],(error,result)=>{
        res.send(result);
    });

});

// Set route for update item
app.post('/items/update',upload.single('itemImage'),(req,res)=>{

    let item_id = req.body.itemId;
    let category_id = req.body.itemCategory;
    let item_name = req.body.itemName;
    let item_price = req.body.itemPrice;
    let item_description = req.body.itemDescription;
    let item_image ;
    if(!!req.file){
        item_image = req.body.itemImageEdit;
    } else {
        item_image = req.file.filename;
    }

    connection.query('CALL UpdateItem(?,?,?,?,?,?)',
    [item_id,item_name,item_price,item_description,item_image,category_id],(error,result)=>{
        res.redirect("/items");
        });

});

// Set route for delete item
app.get('/items/delete/:item_id',(req,res)=>{

    let item_id = req.params.item_id;

    connection.query('CALL DeleteItem(?)',[item_id],(error,result)=>{
        res.redirect("/items");
    });

});

// Set route for get all order of specific agent
app.get('/orders/',(req,res)=>{
    let agent_id = "0b4328a8-26e0-11e9-8df0-f23c91f3c86e";
    connection.query('CALL GetAllOrders(?)',[agent_id],(error,results)=>{
        res.render('pages/orders.ejs',{
            deliverd: results[0][0].deliverd,
            underDelivery: results[1][0].underDelivery,
            reject: results[2][0].reject,
            suspended: results[3][0].suspended,
            orders: results[4]
        });
    });

});

// Set route for show order details
app.get('/orders/details/:order_id',(req,res)=>{
    let order_id = req.params.order_id
    connection.query('CALL GetOrderDetails(?)',[order_id],(error,results)=>{
        res.send(results);
    });

});

// Set route for accept order 
app.get('/orders/accept/:order_id/:page',(req,res)=>{
    let order_id = req.params.order_id;
    let page = req.params.page;
    let order_type = 1 ;
    connection.query('CALL ChangeOrderStutes(?,?)',[order_id,order_type],(error,results)=>{
        if(page == 'orders'){
            res.redirect("/orders");
        }else{
            res.redirect("/"); 
        }
        
    });

});

// Set route for reject order 
app.get('/orders/reject/:order_id/:page',(req,res)=>{
    let order_id = req.params.order_id;
    let page = req.params.page;
    let order_type = 0;
    connection.query('CALL ChangeOrderStutes(?,?)',[order_id,order_type],(error,results)=>{
        if(page == 'orders'){
            res.redirect("/orders");
        }else{
            res.redirect("/"); 
        }
    });

});

// Set route for get all categories of specific agent
app.get('/categories',(req,res)=>{
    let agent_id = "0b4328a8-26e0-11e9-8df0-f23c91f3c86e";
    connection.query('CALL GetAllCategories(?)',[agent_id],(error,results)=>{
        res.render('pages/categories.ejs',{
            categories: results[0]
        });
    });

});

// Set route for add category 
app.get('/categories/get',(req,res)=>{
    let agent_id = "0b4328a8-26e0-11e9-8df0-f23c91f3c86e";
    connection.query('CALL GetAllCategories(?)',[agent_id],(error,results)=>{
        res.send(results[0]);
    })

});

// Set route for insert gategory in database
app.post('/categories/add',upload.single('addCategoryImage'),(req,res)=>{

    let agent_id = "0b4328a8-26e0-11e9-8df0-f23c91f3c86e";
    let category_name = req.body.addCategoryName;
    let category_image = req.file.filename;

    connection.query('CALL InsertCategory(?,?,?)',
        [agent_id,category_name,category_image],(error,results)=>{
            res.redirect("/categories");
    });

});

// Set route for edit category
app.get('/categories/:category_id',(req,res)=>{

    let category_id = req.params.category_id;

    connection.query('CALL GetCateory(?)',[category_id],(error,result)=>{
        res.send(result[0]);
    });

});

// Set route for update item
app.post('/categories/update',upload.single('editCategoryImage'),(req,res)=>{

    let category_id = req.body.editCategoryId;
    let category_name = req.body.editCategoryName;
    let category_image ;
    if(!req.file){
        category_image = req.body.categoryImage;
    } else {
        category_image = req.file.filename;
    }

    connection.query('CALL UpdateCategory(?,?,?)',
    [category_id,category_name,category_image],(error,result)=>{
        res.redirect("/categories");
    });

});

// Set route for delete category
app.get('/categories/delete/:category_id',(req,res)=>{

    let category_id = req.params.category_id;

    connection.query('CALL DeleteCategory(?)',[category_id],(error,result)=>{
        res.redirect("/categories");
    });

});

