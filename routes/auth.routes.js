const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const userSchema = require("../model/User");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');


router.post("/register-user",
    [
        check('name')
            .not()
            .isEmpty()
            .isLength({ min: 4 })
            .withMessage('Name must be atleast 4 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('password', 'Password should be more 6 characters long')
            .not()
            .isEmpty()
            .isLength({ min: 6 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
       // console.log(req.body);

        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }
        else {
            bcrypt.hash(req.body.password, 10).then((hash) => {
                const user = new userSchema({
                    name: req.body.name,
                    email: req.body.email,
              
                    password: hash
                });
                user.save().then((response) => {
                    res.status(201).json({
                        message: "User successfully created!",
                        result: response
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
            });
        }
    });


// Sign-in
router.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed: wrong email"
            });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(401).json({
                message: "Authentication failed:wrong password"
            });
        }
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiresIn: "1 year"
        });
        res.status(200).json({
            token: jwtToken,
            user:getUser,
            expiresIn: 31536000,
            _id: getUser._id
        });
    }).catch(err => {
        return res.status(401).json({
            message: "Authentication failed"
        });
         
    });
});


// Get Single User
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})





// Get Users
router.route('/').get((req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})



// Update User
router.route('/update-user/:id').patch((req, res, next) => {
    userSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
             
        } else {
            res.json(data)
             
            console.log('User successfully updated!')
        }
    })
})


// Delete User
router.delete('/delete-user/:id', (req, res, next) => {
    userSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg:'USER DELETED SUCCESSFULY', data
            })
        }
    })
})

module.exports = router;

 