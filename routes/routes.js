const bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
var User = require('../models/user');
var Product = require('../models/product');
var nodemailer = require('nodemailer');
var Order = require('../models/order');


//cau hinh email
let tranposter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dunguyen20091998@gmail.com',
        pass: '22091998'
    }
});
module.exports = function (app, passport) {
    app.get('/', (req, res) => {
        Product.find((err, result) => {
            if (err) throw err;
            let rs=processresult(0,result);
            res.render('home', {
                user: req.user,
                product:rs
            });
        })

    })
        ;
    app.get('/login', function (req, res) {
        res.render('login');
    });
    app.post('/login', passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));
    app.get('/singup', function (req, res) {
        res.render('singup');
    });
    app.post('/singup', passport.authenticate('singup', {
        successRedirect: '/',
        failureRedirect: '/singup',
        failureFlash: true
    }));
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('inforuser', {
            user: req.user
        });
    });
    app.post('/profile', isLoggedIn, function (req, res) {
        res.json({ user: req.user });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    //get pass
    app.get('/forgetpass', (req, res) => {
        res.render('repass');
    });
    app.post('/forgetpass', (req, res) => {
        let a = req.body;
        console.log(a.phone + "    " + a.email);
        User.findOne({
            phone: a.phone,
            email: a.email
        }, (err, user) => {
            if (err) throw err;
            if (!user) res.json("ko tim thay, vui long nhap lai")
            if (user) {
                console.log(user);

                let b = 999999999;
                while (b < 1000000000) {
                    b = Math.random() * 9999999999;
                    b = b - b % 1;
                }
                let c = "New password for User with phone " + user.phone + " is ";
                c = c + b;
                b = bcrypt.hashSync(b);
                console.log(b);
                User.update({
                    phone: a.phone
                }, {
                        pass: b
                    }, (err, result) => {
                        if (err) throw err;
                        else {
                            res.redirect('logout');
                            console.log("Success")
                        }
                    });
                sendMail(a.email, "We takem new password for your account", c);

            }
        })
    });
    //resetpass
    app.get('/user/resetpass', isLoggedIn, (req, res) => {
        console.log(req.user);
        res.render('resetpass', {
            user: req.user
        });
    });
    app.post('/user/resetpass', isLoggedIn, (req, res) => {
        let a = req.user;
        let b = req.body;
        //  console.log(a);
        console.log(b.pass1 + "   " + b.pass2 + "    " + b.pass3);
        if (b.pass3 != b.pass2 || b.pass2.length < 5) {
            res.render('message', {
                user: req.user,
               message: "Thông tin bạn nhập không chính xác! Vui lòng nhập lại!"
            });
        }
        else {

            User.findOne({
                phone: a.phone
            }, (err, result) => {
                if (err) throw err;
                if (!result) res.json("khong hop le");
                else {
                    if (bcrypt.compareSync(b.pass1, result.pass)) {

                        let pa = bcrypt.hashSync(b.pass2);
                        console.log(pa);
                        User.update({
                            phone: a.phone
                        }, {
                                pass: pa
                            }, (err, result) => {
                                if (err) throw err;
                                else {
                                    console.log("Sucess");
                                    res.redirect('../logout');
                                }
                            });
                    }
                    else {
                        res.render('message', {
                            user: req.user,
                            message: "Sai mật khẩu! Vui lòng nhập lại"
                        })
                    }
                }
            })
        }
    });

    //upload product
    app.get('/user/uploadproduct', isLoggedIn, (req, res) => {
        if (req.user.auth == 1) {
            res.render('uploadproduct', {
                user: req.user
            });
        }
        else {
            res.render('message', {
                user: req.user,
                message: "Ban can xac thuc de thuc hien chuc nang nay!"
            })
        }
    });
    app.post('/user/uploadproduct', isLoggedIn, (req, res) => {
        if (req.user.auth == 1) {
            let a = req.body;
            console.log(a);
            let p = new Product();
            p.name = a.name;
            p.price = parseInt(a.price.split(',').join(''));
            p.state = a.state;
            let img = [];
            img.push(a.img1); console.log(img);
            if (a.img2.length > 0) img.push(a.img2); console.log(img);
            if (a.img3.length > 0) img.push(a.img2); console.log(img);

            p.imgavata = a.img1;
            p.time_creat = new Date();
            p.like = [];
            p.comment = [];
            p.dislike = [];
            p.rate = [];
            p.img = img;
            p.id_owner = req.user.id;
            p.brand = xoadau(a.brand);
            p.categories = a.categories;
            p.described = a.described;
            console.log(p);
            p.save((err) => {
                if (err) throw err;
                if (!err) res.redirect('/');
            })
        }
        else {
            res.render('message', {
                user: req.user,
                message: "Ban can xac thuc de thuc hien chuc nang nay!"
            })
        }

    });
    //form buy
    app.get('/user/buy/:id([a-zA-Z0-9]{1,100})', (req, res) => {
        let a = req.params;
        console.log(a);
        let b;
        Product.findById(a.id, (err, result) => {
            if (err) throw err;
            b = result;
            console.log(b);
            res.render('formbuy', {
                user: req.user,
                product: b
            })
        });

    });
    app.post('/user/buy/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        if (req.user.auth == 1) {
            let c = req.params;
            let a = req.body;


            Product.findById(c.id, (err, result) => {
                if (err) throw err;
                let a = req.body;
                let b = req.user;
                console.log(req.user._id + result.id_owner);
                if (req.user._id == result.id_owner) {
                    let c = '/product/getinfor/' + result._id;
                    res.redirect(c);
                }
                else {
                    if (result.state >= req.body.soluong) {
                        let d = new Date();
                        neworder = new Order();

                        neworder.rate = 0;
                        neworder.id_owner = result.id_owner;
                        neworder.cancel = 1;
                        neworder.email_buy = req.user.email;
                        neworder.id_buy = b._id;
                        neworder.note = a.note;
                        neworder.id_product = result._id;
                        neworder.time = d;
                        neworder.soluong = a.soluong;
                        neworder.address = a.address;
                        neworder.name_product = result.name;
                        neworder.price = result.price * req.body.soluong;
                        neworder.vanchuyen = a.gh;
                        neworder.thanhtoan = a.TT;
                        neworder.tel = b.tel;
                        neworder.state = "XET DUYET";
                        console.log(neworder);
                        let p = result.state;
                        p = p - req.body.soluong;
                        console.log(p + " " + result.id);

                        Product.update({
                            _id: result.id
                        }, {
                                state: p
                            }, (err, result1) => {
                                if (err) throw err;
                                else console.log("ok");
                            });

                        neworder.save((err) => {
                            if (err) throw err;
                            else console.log("Sucess")
                        });
                        let c = "You have ordered the order :" + neworder._id + " .The order is 'XET DUYET' buy seller. We will email to you anther state of order. Thank you";
                        let mailOptions = {
                            from: 'dunguyen20091998@gmail.com',
                            to: b.email,
                            subject: 'ORDER',
                            text: c
                        };
                        tranposter.sendMail(mailOptions, (err, result) => {
                            if (err) throw err;
                            else {
                                res.render('message', {
                                    user: req.user,
                                    message: "Ban da dat hang thanh cong"
                                })
                                console.log("sent email " + result.response);
                            }
                        });
                    }
                    else res.render('message', {
                        user: req.user,
                        message: "thong tin ban nhap co sai xot, vui long kiem tra lai"
                    })
                }
            });
        } else {
            res.render('message', {
                user: req.user,
                message: "Ban can xac thuc de thuc hien chuc nang nay!"
            })
        }


    });
    app.get('/user', isLoggedIn, (req, res) => {
        res.render('user', {
            user: req.user
        })
    })
    app.get('/user/update', isLoggedIn, (req, res) => {
        res.render('update', {
            user: req.user
        })
    })
    app.post('/user/update', isLoggedIn, (req, res) => {

        let a = req.body;
        console.log(a.name.length + "  " + req.user.phone + a.avata);
        if (req.body.phone.length == 10) {
            User.findOne({
                phone: req.body.phone
            }, (err, result) => {
                if (err) throw err;
                if (result) {
                    res.render('message', {
                        user: req.user,
                        message: "So dt da duoc dang ki, vui long thu lai"
                    });
                }
                if (!result) {
                    if (req.body.email.length > 0) {
                        User.findOne({
                            email: req.body.email
                        }, (err, result1) => {
                            if (err) throw err;
                            if (result1) {
                                res.render('message', {
                                    user: req.user,
                                    message: "Email nay da duoc su dung, vui long thu lai"
                                })
                            }
                            if (!result1) {
                                User.update({
                                    phone: req.user.phone
                                }, {

                                        phone: (req.body.phone.length > 0) ? req.body.phone : req.user.phone,
                                        email: (req.body.email.length > 0) ? req.body.email : req.user.email,
                                        name: (req.body.name.length > 0) ? req.body.name : req.user.name,
                                        avata: (req.body.avata.length > 0) ? req.body.avata : req.user.avata,
                                    }, (err, result2) => {
                                        if (err) throw err;

                                        console.log("Sucess");
                                    });
                            }
                        });
                    }
                    else {
                        User.update({
                            phone: req.user.phone
                        }, {

                                phone: (req.body.phone.length > 0) ? req.body.phone : req.user.phone,
                                email: (req.body.email.length > 0) ? req.body.email : req.user.email,
                                name: (req.body.name.length > 0) ? req.body.name : req.user.name,
                                avata: (req.body.avata.length > 0) ? req.body.avata : req.user.avata,
                            }, (err, result2) => {
                                if (err) throw err;
                                console.log("Sucess");

                            });
                    }

                }
            });

        }
        if (req.body.phone.length == 0) {
            //khong co SDT
            if (req.body.email.length > 0) {
                User.findOne({
                    email: req.body.email
                }, (err, result1) => {
                    if (err) throw err;
                    if (result1) {
                        res.render('message', {
                            user: req.user,
                            message: "Email nay da duoc su dung, vui long thu lai"
                        })
                    }
                    if (!result1) {
                        User.update({
                            phone: req.user.phone
                        }, {

                                phone: (req.body.phone.length > 0) ? req.body.phone : req.user.phone,
                                email: (req.body.email.length > 0) ? req.body.email : req.user.email,
                                name: (req.body.name.length > 0) ? req.body.name : req.user.name,
                                avata: (req.body.avata.length > 0) ? req.body.avata : req.user.avata,
                            }, (err, result2) => {
                                if (err) throw err;
                                else {
                                    console.log("Sucess");
                                }
                            });
                    }
                });
            }
            else {
                User.update({
                    phone: req.user.phone
                }, {

                        phone: (req.body.phone.length > 0) ? req.body.phone : req.user.phone,
                        email: (req.body.email.length > 0) ? req.body.email : req.user.email,
                        name: (req.body.name.length > 0) ? req.body.name : req.user.name,
                        avata: (req.body.avata.length > 0) ? req.body.avata : req.user.avata,
                    }, (err, result2) => {
                        if (err) throw err
                        console.log("Sucess");

                    });
            }
        }
        if (0 < req.body.phone.length && req.body.phone.length != 10) {
            res.render('message', {
                user: req.user,
                message: "So dt sai"
            })
        }
        else {
            res.redirect('../');
        }


    });
    //get user-order

    app.get('/user/order', isLoggedIn, (req, res) => {
        let a = req.user;
        console.log(a._id);
        Order.find({
            id_buy: req.user._id
        }, (err, result) => {
            if (err) throw err

            let c = kiemtra(result); console.log(c);
            let rs1 = processresult(0, result);
            res.render('order', {
                message: "Danh sach don ",
                user: req.user,
                order: rs1,
                a1: c[0],
                a2: c[1],
                a3: c[2],
                a4: c[3],
                a5: c[4]
            })
        })
    });
    app.get('/user/order/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        let a = req.user;
        console.log(a._id);
        Order.find({
            id_buy: req.user._id
        }, (err, result) => {
            if (err) throw err

            let c = kiemtra(result); console.log(c);
            let rs1 = processresult(req.params.id, result);
            res.render('order', {
                message: "Danh sach don ",
                user: req.user,
                order: rs1,
                a1: c[0],
                a2: c[1],
                a3: c[2],
                a4: c[3],
                a5: c[4]
            })
        })
    });
    app.post('/user/order', isLoggedIn, (req, res) => {
        let a = req.user;
        console.log(a._id);
        Order.find({
            id_buy: req.user._id
        }, (err, result) => {
            if (err) throw err
            let c = kiemtra(result);
            res.render('order', {
                message: "Danh sach don hang ",
                user: req.user,
                order: result,
                a1: c[0],
                a2: c[1],
                a3: c[2],
                a4: c[3],
                a5: c[4]
            })
        })
    });
    app.get('/user/neworder', isLoggedIn, (req, res) => {
        let a = req.user;
        console.log(a._id);
        Order.find({
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err;

            //console.log("--------"+kiemtra(result));
            let c = kiemtra(result); console.log(c);
            let res1 = processresult(0, result);
            res.render('confirmorder', {
                message: "Danh sach don hang duoc yeu cau",
                user: req.user,
                order: res1,
                a1: c[0],
                a2: c[1],
                a3: c[2],
                a4: c[3],
                a5: c[4]
            })
        })
    });
    app.post('/user/neworder', isLoggedIn, (req, res) => {
        let a = req.user;
        console.log(a.email);
        Order.find({
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err
            let c = kiemtra(result);
            res.render('confirmorder', {
                message: "Danh sach don hang duoc yeu cau",
                user: req.user,
                order: result,
                a1: c[0],
                a2: c[1],
                a3: c[2],
                a4: c[3],
                a5: c[4]
            })
        })
    })
    app.get('/user/neworder/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        let a = req.user;
        console.log(a._id);
        Order.find({
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err;

            //console.log("--------"+kiemtra(result));
            let c = kiemtra(result); console.log(c);
            let res1 = processresult(req.params.id, result);
            res.render('confirmorder', {
                message: "Danh sach don hang duoc yeu cau",
                user: req.user,
                order: res1,
                a1: c[0],
                a2: c[1],
                a3: c[2],
                a4: c[3],
                a5: c[4]
            })
        })
    });
    //cap nhat trang thai don hang cua nguoi mua
    app.post('/user/neworder/process/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        console.log(req.body.aq + "  ");
        console.log(req.user.email);


        Order.findById(req.params.id, (err, result4) => {
            if (err) throw err;
            if (result4.state.length != 7 && result4.state.length != 8) {


                if (req.body.aq == 1) {
                    console.log("1qa")
                    Order.update({
                        _id: req.params.id,
                        id_owner: req.user._id
                    }, {
                            state: "HUY DON",
                            cancel: 3
                        }, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                            Order.findById(req.params.id, (err, result1) => {
                                if (err) throw err;

                                let c = " the order :" + result1._id + " is 'HUY DON HANG' buy seller. Thank you";
                                sendMail(result1.email_buy, "ORDER", c);

                            })
                            res.redirect('../');
                        })
                }
                if (req.body.aq == 2) {
                    console.log("2qa")
                    Order.update({
                        _id: req.params.id,
                        id_owner: req.user._id
                    }, {
                            state: "DANG CHUAN BI"
                        }, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                            Order.findById(req.params.id, (err, result1) => {
                                if (err) throw err;

                                let c = " the order :" + result1._id + " is 'DANG CHUAN BI' buy seller. Thank you";
                                sendMail(result1.email_buy, "ORDER", c);

                            })
                            res.redirect('../');
                        })
                }

                if (req.body.aq == 3) {
                    console.log("3qa")
                    Order.update({
                        _id: req.params.id,
                        id_owner: req.user._id
                    }, {
                            state: "DANG GIAO HANG"
                        }, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                            Order.findById(req.params.id, (err, result1) => {
                                if (err) throw err;

                                let c = " the order :" + result1._id + " is 'DANG GIAO HANG' buy seller. Thank you";
                                sendMail(result1.email_buy, "ORDER", c);

                            })
                            res.redirect('../');
                        })
                }
                if (req.body.aq == 4) {
                    console.log("1qa")
                    Order.update({
                        _id: req.params.id,
                        id_owner: req.user._id
                    }, {
                            state: "KET THUC"
                        }, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                            Order.findById(req.params.id, (err, result1) => {
                                if (err) throw err;

                                let c = " the order :" + result1._id + " is end. Thank you";
                                sendMail(result1.email_buy, "ORDER", c);

                            })
                            res.redirect('../');
                        })
                }




            }
            else res.redirect('../');
        })




    })
    //huy don boi nguoi dung
    app.get('/user/order/cancel/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        console.log(req.params.id + "  " + req.user._id);

        Order.find({
            _id: req.params.id,
            id_buy: req.user._id
        }, (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                res.render('message', {
                    user: req.user,
                    message: "BAN KHONG THE HUY DON HANG CUA NGUOI KHAC"
                })
            }

            if (result.length > 0) {
                if (result[0].state.length == 9) {
                    console.log(result[0].id_buy + " " + req.user._id + " " + result[0].id_product)


                    Product.findById(result[0].id_product, (err, product) => {
                        if (err) throw err;
                        if (product) {
                            console.log(product.state + " ")
                            Product.update({
                                _id: product._id
                            }, {
                                    state: product.state + result[0].soluong
                                }, (err, okk) => {
                                    if (err) throw err;

                                })
                        }
                    })

                    Order.update({
                        _id: req.params.id
                    }, {
                            state: 'HUY DON',
                            cancel: 2
                        }, (err, ok) => {
                            if (err) throw err;
                            console.log("ok");
                            res.redirect('../');
                        })
                }
                else {
                    res.redirect('../')
                }
            }

        })
    })
    app.post('/user/order/cancel/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        console.log(req.params.id);
        Order.find({
            _id: req.params.id,
            id_buy: req.user._id
        }, (err, result) => {
            console.log(result)
            if (err) throw err;
            if (result.length == 0) {
                res.render('message', {
                    user: req.user,
                    message: "BAN KHONG THE HUY DON HANG CUA NGUOI KHAC"
                })
            }

            if (result.length > 0) {
                if (result[0].state.length == 9) {
                    console.log(result[0].id_buy + " " + req.user._id + " " + result[0].id_product)


                    Product.findById(result[0].id_product, (err, product) => {
                        if (err) throw err;
                        if (product) {
                            console.log(product.state + " ")
                            Product.update({
                                _id: product._id
                            }, {
                                    state: product.state + result[0].soluong
                                }, (err, okk) => {
                                    if (err) throw err;

                                })
                        }
                    })

                    Order.update({
                        _id: req.params.id
                    }, {
                            state: 'HUY DON',
                            cancel: 2
                        }, (err, ok) => {
                            if (err) throw err;
                            console.log("ok");
                            res.redirect('../');
                        })
                }
                else {
                    res.redirect('../')
                }
            }

        })
    })
    //cap nhat hang ho0a
    app.get('/user/product', isLoggedIn, (req, res) => {
        Product.find({
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err;
            let rs = processresult(0, result);
            res.render('danhmuc', {
                message: "Danh muc mat hang cua ban",
                user: req.user,
                product: rs
            });
        })
    })
    app.get('/user/product/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        Product.find({
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err;
            let rs = processresult(req.params.id, result);
            res.render('danhmuc', {
                message: "Danh muc mat hang cua ban",
                user: req.user,
                product: rs
            });
        })
    })
    app.get('/user/product/update/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        Product.find({
            _id: req.params.id,
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err;
            if (result) {
                console.log(result)
                res.render('updateproduct', {
                    user: req.user,
                    product: result
                })
            }
            if (!result) {
                res.redirect('./logout')
            }
        })
    });
    app.post('/user/product/update/:id([a-zA-Z0-9]{1,100})', isLoggedIn, (req, res) => {
        console.log(req.body);
        Product.find({
            _id: req.params.id,
            id_owner: req.user._id
        }, (err, result) => {
            if (err) throw err;
            if (result) {
                let imga = result.img;
                // console.log(imga);

                Product.update({
                    _id: req.params.id
                }, {
                        name: (req.body.name.length > 0) ? req.body.name : result[0].name,
                        state: (req.body.state > 0) ? req.body.state : result[0].state,
                        price: (req.body.price > 0) ? req.body.price : result[0].price,
                        imgavata: (req.body.img.length > 0) ? req.body.img : result[0].imgavata,
                        described: (req.body.described.length > 0) ? req.body.described : result[0].described,
                    }, (err, result1) => {
                        if (err) throw err;
                        res.redirect('../')
                        console.log(result1)
                    })
            }
            if (!result) {
                res.redirect('/');
            }
        })
    });
    app.get('/product/getinfor/:id([0-9a-zA-Z]{1,100})/:like([a-zA-Z]{1,10})', isLoggedIn, (req, res) => {
        Product.findById(req.params.id, (err, result) => {
            if (err) throw err;
            if (result) {
                console.log(result)
                if (req.params.like == "like") {
                    let id1 = req.user._id.toString();
                    let dem = 0, dem2 = 0;
                    for (let i = 0; i < result.like.length; i++) {
                        let id2 = result.like[i].toString();
                        if (id1 == id2) {
                            dem = 1; break;
                        }

                    }
                    for (let i = 0; i < result.dislike.length; i++) {
                        let id2 = result.dislike[i].toString();
                        if (id1 == id2) {
                            dem2 = 2; break;
                        }

                    }
                    if (dem2 > 0) {
                        res.redirect('./');
                    }
                    else {
                        if (dem > 0) {
                            console.log("ban da like");
                            res.redirect('./');
                        }
                        if (dem == 0) {
                            console.log("ban de dc like");
                            Product.update({
                                _id: req.params.id
                            }, {
                                    $push: { like: req.user._id }
                                }, (err, ok) => {
                                    if (err) throw err;
                                });
                            User.update({
                                _id: req.user._id
                            }, {
                                    $push: { like: req.params.id }
                                }, (err, ok1) => {
                                    if (err) throw err
                                })
                            res.redirect('./');
                        }
                    }


                }
                if (req.params.like == "dislike") {
                    let id1 = req.user._id.toString();
                    let dem = 0, dem2 = 0;
                    for (let i = 0; i < result.dislike.length; i++) {
                        let id2 = result.dislike[i].toString();
                        if (id1 == id2) {
                            dem = 1; break;
                        }

                    }
                    for (let i = 0; i < result.like.length; i++) {
                        let id2 = result.like[i].toString();
                        if (id1 == id2) {
                            dem2 = 1; break;
                        }

                    }
                    if (dem2 > 0) {
                        res.redirect('./');
                    }
                    else {
                        if (dem > 0) {
                            console.log("ban da like");
                            res.redirect('./');
                        }
                        if (dem == 0) {
                            console.log("ban de dc like");
                            Product.update({
                                _id: req.params.id
                            }, {
                                    $push: { dislike: req.user._id }
                                }, (err, ok) => {
                                    if (err) throw err;
                                });
                            User.update({
                                _id: req.user._id
                            }, {
                                    $push: { dislike: req.params.id }
                                }, (err, ok1) => {
                                    if (err) throw err
                                })
                            res.redirect('./');
                        }
                    }
                }
                if (req.params.like != "like" && req.params.like != "dislike") {
                    res.redirect('./')
                }
            }
        })

    })
    app.post('/product/getinfor/:id([a-zA-Z0-9]{10,100})', isLoggedIn, (req, res) => {
        let a = req.params.id;
        console.log(a);
        let b = req.body.comment;
        console.log(b);
        Product.findById(a, (err, result) => {
            if (err) throw err;
            if (result) {
                let c = result.comment.length.toString();
                console.log(typeof (c));
                Product.update({
                    _id: a
                }, {
                        $push: { comment: { name: req.user.name, msg: b, answer: "", idcomment: c } }
                    }, (err, ok) => {
                        if (err) throw err;
                        let c = "/product/getinfor/";
                        c = c + a;
                        res.redirect(c);
                    });
            }
        })

    })
    app.get('/user/rateproduct/:id([0-9a-zA-Z]{1,100})', isLoggedIn, (req, res) => {
        Order.find({
            _id: req.params.id,
            id_buy: req.user._id,
            rate: 0
        }, (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                res.redirect('/user/order');
            } if (result.length > 0) {
                Product.findById(result[0].id_product, (err, ok) => {
                    if (err) throw err;
                    if (ok) {
                        res.render('rateproduct', {
                            user: req.user,
                            id: ok.name
                        })
                    }
                })
            }
        })
    })
    app.post('/user/rateproduct/:id([0-9a-zA-Z]{1,100})', isLoggedIn, (req, res) => {
        console.log(req.body);
        Order.find({
            _id: req.params.id,
            id_buy: req.user._id,
            rate: 0
        }, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                Product.findById(result[0].id_product, (err, product) => {
                    if (err) throw err;
                    let c = product.rate.length.toString();
                    Product.update({
                        _id: product._id
                    }, {

                            $push: { rate: { name: req.user.name, msg: req.body.danhgia, sao: req.body.sao, idrate: c } }
                        }, (err, ok) => {
                            if (err) throw err;

                        })
                });
                Order.update({
                    _id: req.params.id
                }, {
                        rate: 2
                    }, (err, ok2) => {
                        if (err) throw err;

                    });
                let c = "/user/order";
                res.redirect(c);
            }
            else {
                res.redirect('/user/order');
            }
        })
    })
    app.get('/auth/:phone([0-9a-zA-z@]{1,100})/:id([a-zA-Z0-9]{1,1000})', (req, res) => {
        console.log(req.params + req.params.phone + req.params.id);
        User.findById(req.params.id, (err, result) => {
            if (err) throw err;
            if (result) {
                User.update({
                    phone: req.params.phone,
                    _id: req.params.id

                }, {
                        auth: 1
                    }, (err, ok) => {
                        if (err) throw err
                        res.render('message', {
                            user: req.user,
                            message: "ban da xac thuc thanh cong"
                        })
                    })
            }
            else {
                res.render('message', {
                    user: req.user,
                    message: "oh! co loi voi xac thuc cua ban"
                })
            }
        })
    })

}
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        // console.log(req.isAuthenticated());
        return next();
    res.redirect('/login');
};
function kiemtra(result) {
    let a1 = 0, a2 = 0, a3 = 0, a4 = 0, a5 = 0;
    let b = result.length
    for (let i = 0; i < b; i++) {
        if (result[i].state.length == 7) a1++;//huy don
        if (result[i].state.length == 8) a2++;//ket thuc
        if (result[i].state.length == 9) a3++;//xet duyet
        if (result[i].state.length == 13) a4++;//dang chuan bi
        if (result[i].state.length == 14) a5++;//dang giao hang
    }
    let c = [a1, a2, a3, a4, a5];


    return c;
}
function sendMail(email, subject, msg) {
    let mailOptions = {
        from: 'dunguyen20091998@gmail.com',
        to: email,
        subject: subject,
        text: msg
    };
    tranposter.sendMail(mailOptions, (err, result2) => {
        if (err) throw err;
        else {
            console.log("sent email ");
        }
    });
}

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
        let c = souce.length - 1 - 12;
        for (let i = souce.length - 1; i >= 0; i--) {
            console.log(id + "   " + souce[i]._id);
            if (id == souce[i]._id) {
                console.log("ok");
                for (let j = i - 1; j >= 0; j--) {

                    if (j < c + 1) break;
                    as.push(souce[j]);
                } return as;

            }
        }

    }
    if (id == 0) {
        let ab = [];
        console.log("0")

        let c = souce.length - 1 - 12;
        for (let i = souce.length - 1; i >= 0; i--) {

            if (i < c + 1) break;
            ab.push(souce[i]);
        }
        console.log(ab);
        return ab;

    }
}
