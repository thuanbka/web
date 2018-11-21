const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
var Product = require('../models/product');

function xoadau(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");


    return str;
}
function processresult(id, souce) {


    if (id != 0) {
        let as = [];
        console.log(">0");
        let c=souce.length-1-20;
        for (let i = souce.length-1;i>=0; i--) {
            console.log(id + "   " + souce[i]._id);
            if (id == souce[i]._id) {
                console.log("ok");
                for (let j = i - 1; j>=0; j--) {

                    if (j <c+1) break;
                    as.push(souce[j]);
                } return as;

            }
        }

    }
    if (id == 0) {
        let ab = [];
        console.log("0")
    
            let c=souce.length-1-20;
            for (let i =souce.length-1; i >=0; i--) {

                if (i <c+1) break;
                ab.push(souce[i]);
            }
            console.log(ab);
            return ab;
        
    }
}


router.route('/search').post((req, res) => {
    let a = req.body.search;
    const kq = [];

    Product.find({}, (err, result) => {
        if (err) throw err;
        a = xoadau(a);
        console.log(a);
        a = a.split(" ");
        for (let i = 0; i < result.length; i++) {
            let b = result[i].name;
            b = xoadau(b);
            console.log(b);
            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {
                    console.log(result[i].name + "");
                    kq.push(result[i]);
                    e = a.length;
                }
            }
        }
        console.log("   " + kq);
        let url = "/product/search/" + req.body.search + "/";
        return res.render('searchresult', {
            url: url,
            product: processresult(0, kq),
            user: req.user,
            search: req.body.search
        });
    })
});
router.route('/search/:name([a-zA-Z0-9]{1,100})/:id([a-zA-Z0-9]{1,100})').get((req, res) => {
    let a = req.params.name;
    let u = req.params.id;
    const kq = [];

    Product.find({}, (err, result) => {
        if (err) throw err;
        a = xoadau(a);
        // console.log(a);
        a = a.split(" ");
        for (let i = 0; i < result.length; i++) {
            let b = result[i].name;
            b = xoadau(b);
            // console.log(b);
            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {
                    console.log(result[i].name + "");
                    kq.push(result[i]);
                    e = a.length;
                }
            }
        }
        console.log("   " + kq.length);
        let w = processresult(u, kq);
        let url = "/product/search/" + req.params.search + "/";
        return res.render('searchresult', {
            url: url,
            product: w,
            user: req.user,
            search: a
        });
    })
})
router.route('/brand/:brand([a-zA-z0-9]{1,100})').get((req, res) => {
    let a = req.params.brand;


    Product.find({}, (err, result) => {
        if (err) throw err;
        a = xoadau(a);
        //  console.log(a);
        a = a.split(" "); let kq = [];
        for (let i = 0; i < result.length; i++) {
            let b = result[i].brand;
            b = xoadau(b);
            //  console.log(b);
            b = b.split(" ");
            for (let e = 0; e < b.length; e++) {
                let num = 0;
                for (let r = 0; r < a.length; r++) {
                    if (b[e] == a[r]) num++;
                }
                if (num > 0) {
                    //    console.log(result[i].brand + "");
                    kq.push(result[i]);
                    e = b.length;
                }
            }
        }
        console.log("   " + kq.length);
        let rs = processresult(0, kq);

        return res.render('searchresult', {
            url: "/product/brand/" + req.params.brand + "/",
            product: rs,
            user: req.user,
            search: "sdf" + req.params.brand
        });

    });

});
router.route('/brand/:brand([a-zA-z0-9]{1,100})').post((req, res) => {
    let a = req.params.brand;
    console.log(req.params.brand);
    const kq = [];

    Product.find({}, (err, result) => {
        if (err) throw err;
        a = xoadau(a);
        //  console.log(a);
        a = a.split(" ");
        for (let i = 0; i < result.length; i++) {
            let b = result[i].brand;
            b = xoadau(b);

            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {

                    kq.push(result[i]);
                    e = b.length;
                }
            }
        }
        console.log(" 999  " + kq.length);
        let rs = processresult(0, kq);
        let url = "/product/brand/" + req.params.brand + "/";
        return res.render('searchresult', {
            url: url,
            product: rs,
            user: req.user,
            search: req.params.brand,
        });
    });

});
router.route('/brand/:brand([a-zA-z0-9]{1,100})/:id([a-zA-Z0-9]{1,100})').get((req, res) => {

    let a = req.params.brand;
    let id = req.params.id;
    // console.log(req.params.brand);


    Product.find({}, (err, result) => {
        if (err) throw err;
        a = xoadau(a);
        //  console.log(a);
        a = a.split(" "); let kq = [];
        for (let i = 0; i < result.length; i++) {
            let b = result[i].brand;
            b = xoadau(b);

            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {

                    kq.push(result[i]);
                    e = b.length;
                }
            }
        }
        console.log("9i" + kq.length);
        let rs = processresult(id, kq);
        let r = "/product/brand/" + req.params.brand+ "/";
        res.render('searchresult', {
            url: r,
            product: rs,
            user: req.user,
            search: req.params.brand,
        });
    });


})
router.route('/category/:category([a-zA-z0-9%]{1,100})').get((req, res) => {
    let a = req.params.category;
    a = xoadau(a);
    a = a.split(" ");
    let kq = [];

    Product.find({}, (err, result) => {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {
            let b = result[i].categories;
            b = xoadau(b);
            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {

                    kq.push(result[i]);
                    e = a.length;
                }
            }
        }

        let rs = processresult(0, kq);

        return res.render('searchresult', {
            url: "/product/category/" + req.params.category + "/",
            product: kq,
            user: req.user,
            search: "Danh muc nganh: " + req.params.category
        })
    })

});
router.route('/category/:category([a-zA-z0-9%]{1,100})').post((req, res) => {
    let a = req.params.category;
    a = xoadau(a);
    a = a.split(" ");
    let kq = [];
    console.log(a);
    Product.find({}, (err, result) => {
        if (err) throw err;
        console.log(result.length)
        for (let i = 0; i < result.length; i++) {
            let b = result[i].categories;
            b = xoadau(b);
            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {
                    console.log(result[i].categories + "j");
                    kq.push(result[i]);
                    e = a.length;
                }
            }
        }
        console.log("   " + kq);
        let rs = processresult(0, kq);

        return res.render('searchresult', {
            url: "/product/category/" + req.params.category + "/",
            product: kq,
            user: req.user,
            search: "Danh muc nganh: " + req.params.category
        })
    })

});
router.route('/category/:category([a-zA-z0-9%]{1,100})/:id([a-zA-Z0-9]{1,100})').get((req, res) => {
    let a = req.params.category;
    let c = req.params.id;
    a = xoadau(a);
    a = a.split(" ");
    let kq = [];

    Product.find({}, (err, result) => {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {
            let b = result[i].categories;
            b = xoadau(b);
            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {

                    kq.push(result[i]);
                    e = a.length;
                }
            }
        }
        console.log("   98" + kq.length);
        let rs = processresult(c, kq);

        return res.render('searchresult', {
            url: "/product/category/" + req.params.category + "/",
            product: (rs.length > 0) ? rs : [],
            user: req.user,
            search: "Danh muc nganh: " + req.params.category
        })
    })

});


router.route('/getinfor/:id([a-zA-Z0-9]{1,100})').get((req, res) => {
    let a = req.params;
    console.log(a);
    Product.findById(a.id, (err, result) => {
        if (err) throw err;
        else {
            let ac = [], ad = [];
          
            for (let i = 0; i < result.comment.length; i++) {
                if (i == 5) break;
                ac.push(result.comment[i]);

            }
            for (let i = 0; i < result.comment.length; i++) {
                if (i == 5) break;
                ad.push(result.rate[i]);

            }


            result.comment = ac;


            if (!req.user) {
                console.log("ok");
                res.render('getinforproduct', {
                    user: req.user,
                    product: result,
                    x: 0
                })
            }
            if (req.user) {
                let id = req.user._id.toString();
                let dem1 = 0, dem2 = 0;
                for (let i = 0; i < result.like.length; i++) {
                    let id1 = result.like[i].toString();
                    if (id == id1) {
                        dem1++; break;
                    }

                }
                for (let i = 0; i < result.dislike.length; i++) {
                    let id1 = result.dislike[i].toString();
                    if (id == id1) {
                        dem2++; break;
                    }

                }

                // console.log(result);
                if (dem1 == 0 && dem2 == 0) {
                    res.render('getinforproduct', {
                        product: result,
                        user: req.user,
                        x: 0
                    })
                }
                if (dem1 > 0) {
                    res.render('getinforproduct', {
                        product: result,
                        user: req.user,
                        x: 9
                    })
                }
                if (dem2 > 0) {
                    res.render('getinforproduct', {
                        product: result,
                        user: req.user,
                        x: -1
                    })
                }
            }
        }
    })

});
router.route('/getinfor/:id([a-zA-Z0-9]{1,100})/comment/:idcomment([0-9]{1,10000})').get((req, res) => {
    let a = req.params;

   
    Product.findById(a.id, (err, result) => {
        if (err) throw err;
        else {
            let ac = [], ad = [];
            let z = parseInt(a.id);
            
            console.log(result.rate.length + "  ok  " + result.comment.length)
            for (let i = z; i < result.comment.length; i++) {
                if (i > z + 5) break;
                ac.push(result.comment[i]);

            }
            result.comment = ac;
            let url = "/product/getinfor/" + a.id;
            // if (ac.length == 0) {
            //     res.redirect(url);
            // }
            // else
            {

                for (let i = 0; i < result.rate.length; i++) {
                    if (i == 5) break;
                    ad.push(result.rate[i]);

                }
                result.rate = ad;


                if (!req.user) {
                    console.log("ok");
                    res.render('getinforproduct', {
                        user: req.user,
                        product: result,
                        x: 0
                    })
                }
                if (req.user) {
                    let id = req.user._id.toString();
                    let dem1 = 0, dem2 = 0;
                    for (let i = 0; i < result.like.length; i++) {
                        let id1 = result.like[i].toString();
                        if (id == id1) {
                            dem1++; break;
                        }

                    }
                    for (let i = 0; i < result.dislike.length; i++) {
                        let id1 = result.dislike[i].toString();
                        if (id == id1) {
                            dem2++; break;
                        }

                    }
                    // console.log(result);
                    if (dem1 == 0 && dem2 == 0) {
                        res.render('getinforproduct', {
                            product: result,
                            user: req.user,
                            x: 0
                        })
                    }
                    if (dem1 > 0) {
                        res.render('getinforproduct', {
                            product: result,
                            user: req.user,
                            x: 9
                        })
                    }
                    if (dem2 > 0) {
                        res.render('getinforproduct', {
                            product: result,
                            user: req.user,
                            x: -1
                        })
                    }
                }
            }
        }
    })

});
router.route('/getinfor/:id([a-zA-Z0-9]{1,100})/rate/:idrate([0-9]{1,10000})').get((req, res) => {
    let a = req.params;

    console.log(typeof (a.idcomment) + a.idcomment);
    Product.findById(a.id, (err, result) => {
        if (err) throw err;
        else {
            let ac = [], ad = [];
            let z = parseInt(a.id);
            console.log(result.rate.length + "  ok  " + result.comment.length)
            for (let i = z; i < result.rate.length; i++) {
                if (i > z + 5) break;
                ac.push(result.rate[i]);

            }
            let url = "/product/getinfor/" + a.id;
            if (ac.length == 0) {
                res.redirect(url);
            }
            else {
                result.rate = ac;
                for (let i = 0; i < result.comment.length; i++) {
                    if (i == 5) break;
                    ad.push(result.comment[i]);

                }
                result.comment = ad;


                if (!req.user) {
                    console.log("ok");
                    res.render('getinforproduct', {
                        user: req.user,
                        product: result,
                        x: 0
                    })
                }
                if (req.user) {
                    let id = req.user._id.toString();
                    let dem1 = 0, dem2 = 0;
                    for (let i = 0; i < result.like.length; i++) {
                        let id1 = result.like[i].toString();
                        if (id == id1) {
                            dem1++; break;
                        }

                    }
                    for (let i = 0; i < result.dislike.length; i++) {
                        let id1 = result.dislike[i].toString();
                        if (id == id1) {
                            dem2++; break;
                        }

                    }
                    // console.log(result);
                    if (dem1 == 0 && dem2 == 0) {
                        res.render('getinforproduct', {
                            product: result,
                            user: req.user,
                            x: 0
                        })
                    }
                    if (dem1 > 0) {
                        res.render('getinforproduct', {
                            product: result,
                            user: req.user,
                            x: 9
                        })
                    }
                    if (dem2 > 0) {
                        res.render('getinforproduct', {
                            product: result,
                            user: req.user,
                            x: -1
                        })
                    }
                }
            }
        }
    })

});

router.route('/:categories([a-zA-Z0-9]{1,100})/brand/:brand([a-zA-Z0-9]{1,100})').get((req, res) => {
    console.log(req.params);
    Product.find({
        categories: req.params.categories,
        brand: xoadau(req.params.brand)
    }, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            res.render('message', {
                user: req.user,
                message: "Khong tim thay san pham",
                product: []
            })
        }
        console.log(result);
        if (result.length > 0) {
            let rs = processresult(0, result);
            let url = "/product/" + req.params.categories + "/brand/" + req.params.brand + "/"
            res.render('searchresult', {
                url: url,
                user: req.user,
                search: "Danh sach san pham",
                product: rs
            })
        }
    })
})
router.route('/:categories([a-zA-Z0-9]{1,100})/brand/:brand([a-zA-Z0-9]{1,100})/:id([0-9A-Za-z]{1,100})').get((req, res) => {
    console.log(req.params);
    Product.find({
        categories: req.params.categories,
        brand: xoadau(req.params.brand)
    }, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            res.render('message', {
                user: req.user,
                message: "Khong tim thay san pham",
                product: []
            })
        }
        console.log(result);
        if (result.length > 0) {
            let rs = processresult(req.params.id, result);
            let url = "/product/" + req.params.categories + "/brand/" + req.params.brand + "/"
            if (rs.length == 0) {
                res.render('message', {
                    user: req.user,
                    message: "Da het san pham",
                    product: []
                })
            }
            else {
                res.render('searchresult', {
                    url: url,
                    user: req.user,
                    search: "Danh sach san pham",
                    product: rs
                })
            }
        }
    })
})

router.route('/other').get((req, res) => {
    Product.find({
        categories: "other"
    }, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            res.render('searchresult', {
                user: req.user,
                search: "Khong tim thay san pham hop le.",
                product: []
            })
        }
        if (result.length > 0) {
            let rs = processresult(0, result);
            let url = "/product/other";
            res.render('searchresult', {
                url: url,
                user: req.user,
                search: "Danh sach cac san pham phu kien",
                product: rs
            })
        }
    })
})
router.route('/other/:id([a-zA-Z0-9]{1,100})').get((req, res) => {
    Product.find({
        categories: "other"
    }, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            res.render('searchresult', {
                user: req.user,
                search: "Khong tim thay san pham hop le.",
                product: []
            })
        }
        if (result.length > 0) {
            let rs = processresult(req.params.id, result);
            let url = "/product/other/";
            if (rs.length == 0) {
                res.render('message', {
                    url:url,
                    user: req.user,
                    message: "Da het san pham",
                    product: []
                })
            }
            else {
                res.render('searchresult', {
                    url: url,
                    user: req.user,
                    search: "Danh sach cac san pham phu kien",
                    product: rs
                })
            }
        }
    })
})

router.route('/store/:id([a-zA-Z0-9]{1,100})').get((req, res) => {

    Product.find({
        id_owner:req.params.id
    },(err,result)=>{
        if(err) throw err;
        let url="/product/store/"+req.params.id+"/";
        let rs=processresult(0,result);
        res.render('store',{
            url:url,
            user:req.user,
            search:req.params.id,
            product:rs
        })
    })

})
router.route('/store/:id([a-zA-Z0-9]{1,100})/:ie([0-9a-zA-Z]{1,100})').get((req, res) => {

    Product.find({
        id_owner:req.params.id
    },(err,result)=>{
        if(err) throw err;
        let url="/product/store/"+req.params.id+"/";

        let rs=processresult(req.params.ie,result);

        res.render('store',{
            url:url,
            user:req.user,
            search:req.params.id,
            product:rs
        })
    })

})
router.route('/answer/:id([a-zA-Z0-9]{1,100})/:s([0-9]{1,1000})').post((req, res) => {
    let a = req.params.id;
    let s = req.params.s;
    console.log(s);
    console.log(a);
    let b = req.body.comment;
    console.log(b);

    Product.update({
        _id: a,
        "comment.idcomment": s,
        id_owner: req.user._id
    }, {
            $set: { "comment.$.answer": b }
        }, (err, result) => {
            if (err) throw err;
            let c = "/product/getinfor/";
            c = c + a;
            console.log(result);
            res.redirect(c);

        })
})


module.exports = router;
