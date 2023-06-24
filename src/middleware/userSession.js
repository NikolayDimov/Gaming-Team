// TOKEN
const { verifyToken } = require("../services/userService");

exports.hasToken = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const userData = verifyToken(token);
            req.user = userData;
            // console.log(userData);
            // {
            //     _id: '6487641b98fd78398bbddbe5',
            //     username: 'Niki9',
            //     email: 'niki@abv.bg',
            //     iat: 1686594587,
            //     exp: 1686598187
            // }
            //в main.hbs се вижда потребителското име горе в лентата
            //res.locals = userData;
            res.locals.email = userData.email;
            res.locals.username = userData.username;

            res.locals.isAuthenticated = true;
            
        } catch (err) {
            res.clearCookie('token');
            res.redirect('/login');
            return;
        }
    }

    next();
};


exports.isAuth = (req, res, next) => {
    if(!req.user) {
        res.redirect('/login');
    } 
    next();
}


//-------------------------------------------------------------------------

// SESSION

// function userSession() {
//     return function (req, res, next) {
//         // if we have logged in User -->> req.session.user
//         if(req.session.user) {
//             res.locals.user = req.session.user;
//             res.locals.hasUser = true;

//             // console.log(res.locals.user);
//             // console.log(req.session.user);
//             // {
//             //     _id: '646930844befe24e549459d3',
//             //     email: 'niki@abv.bg',
//             //     hashedPassword: '$2b$10$hRdLhhXVCLdMPcwTaFZngepqklA3WvQYn3AzFVQ.lZbMqjMGOKXcq',
//             //     gender: 'male',
//             //     trips: [],
//             //     __v: 0
//             // }

//         }
//         next();
//     };
// }


// module.exports = userSession;