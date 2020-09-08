const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-dimpal:abhinav@dimpal@todolist.bcoon.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useFindAndModify', false);

const itemsSchema = {
    name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "welcome to todolist",
});
const item2 = new Item({
    name: "hit + to add new item",
});

const item3 = new Item({
    name: "test",
});

const listSchema = {
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("list",listSchema);




app.get("/", function (req, res) {
    Item.find({}, function (err, results) {
        if (results.length === 0) {
            Item.insertMany([item1, item2, item3], function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("inserted successfully");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", { listTitle: "Today", newListItems: results });
        }
        
    });

});
app.post("/", function (req, res) {
   const itemName =  req.body.newItem;
   const listName = req.body.list;
   const item = new Item({
       name:itemName,
   });
   if(listName === "Today")
   {
    item.save();
    res.redirect("/");

   }
   else{
       List.findOne({name:listName},function(err,results)
       {
           if(!err)
           {
            results.items.push(item);
            results.save();
            res.redirect("/"+listName);
           }
       });
   }
 
});

app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.deleteOne({_id:checkedItemId},function(err)
  {
      if(err)
      {
          console.log(err);
      }
      else{
          
          res.redirect("/");
      }
  });
  }
  else{
      List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkedItemId}}}, function(err,results)
      {
          if(!err)
          {
            res.redirect("/" + listName);
          }
      });
  }
  
});


app.get("/:customlistname",function(req,res){
    const customListName = _.capitalize(req.params.customlistname);
    List.findOne({name:customListName},function(err,results)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            if(!results)
            {    const list = new List({
                name:customListName,
                items:[item1, item2, item3]
            });
            list.save();
            res.redirect("/"+customListName);
            }
            else
            {
             res.render("list",{listTitle: results.name, newListItems: results.items});
            }
        }
    });
   
   
   
});

app.get("/about", function (req, res) {
    res.render("about");
})
const port = process.env.PORT||3000;
app.listen(port, function () {
    console.log("server started on port 3000");
});
