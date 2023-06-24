const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { createGame, getAllGames, getGameById, deleteById, editGame, buyGame } = require('../services/gameService');
const mapErrors = require('../util/mapError');
// const preload = require('../middleware/preload');
const { search } = require('../services/searchService');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Create Game', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const gameData = {
        platform: req.body.platform,
        name: req.body.name,
        image: req.body.image,
        price: Number(req.body.price),
        genre: req.body.genre,
        description: req.body.description,
        owner: req.user._id,
    };

    try {
        // if (Object.values(gameData).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await createGame(gameData);
        res.redirect('/catalog');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Create Game', data: gameData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/catalog', async (req, res) => {
    const games = await getAllGames();
    // console.log(games);

    // --------------------------------------
    // courses = await getAllByDate(req.query.search);
   
    // res.render('catalog', {
    //     title: 'Home Page',
    //     courses,
    //     search: req.query.search
    // });
    // -------------------------------------------------

    res.render('catalog', { title: 'Catalog Game', games });

    //SORTING by Likes and date
    // if(req.query.orderBy == 'likes') {
    //     const plays = await sortByLikes(req.query.orderBy);
    //     res.render('catalog', { title: 'Theater Catalog', plays });

    // } else {
    //     const plays = await getAllPlays();
    //     res.render('catalog', { title: 'Theater Catalog', plays });
    // }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details', isAuth, async (req, res) => {
    const currGame = await getGameById(req.params.id);
    console.log(currGame);
    const isOwner = currGame.owner == req.user?._id;
    const isBuyer = currGame.boughtBy?.some(id => id == req.user?._id);
    

    res.render('details', { title: 'Game Details', currGame, isOwner, isBuyer });
});



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });



router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    const currGame = await getGameById(req.params.id);
    try {
        // console.log(currGame);
        if (currGame.owner != req.user._id) {
            throw new Error('Cannot edit Game that you are not owner');
        }

        const platformMap = {
            'PC': 'PC',
            'Nintendo': 'Nintendo',
            'PS4': 'PS4',
            'PS5': 'PS5',
            'XBOX': 'XBOX'
        };
    
        const platformMethods = Object.keys(platformMap).map(key => ({
            value: key, 
            label: platformMap[key] ,
            isSelected: currGame.platform == key
        }));

        res.render('edit', { title: 'Edit Game', currGame, platformMethods });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const currGameOwner = await getGameById(req.params.id);
    
    if (currGameOwner.owner != req.user._id) {
        throw new Error('Cannot edit Game that you are not owner');
    }

    const gameId = req.params.id;
   
    const currGame = {
        platform: req.body.platform,
        name: req.body.name,
        image: req.body.image,
        price: Number(req.body.price),
        genre: req.body.genre,
        description: req.body.description,
    };

    try {
        // Имаме валидация в Модела, затова не ни трябва тук
        // if (Object.values(currEditBook).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await editGame(gameId, currGame);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
        // 2 начина да добавим _id към редактирания обект:
        // currEditBook._id = bookId;  -->> служи да подадем id в edit.hs, но там диретно трием action=""
        // currBook: Object.assign(currEditBook, { _id: req.params.id }),

        res.render('edit', { title: 'Edit Game', currGame, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    try {
        const currGame = await getGameById(req.params.id);
        // console.log(currProduct);
        if (currGame.owner != req.user._id) {
            throw new Error('Cannot delete Game that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/catalog');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
});


router.get('/catalog/:id/buy', isAuth, async (req, res) => {
    await buyGame(req.user._id, req.params.id);

    res.redirect(`/catalog/${req.params.id}/details`);
});




// Search 100% working

router.get('/search', async (req, res) => {
    let gameText = req.query.name;
    let gamePlat = req.query.platform;

    let game = await search(gameText, gamePlat);

    if (game == undefined) {
        game = await getAllGames();
    }

    console.log(game);

    res.render('search', { game })
});


// Search  working for template search_2.hbs

// router.get('/search', async (req, res) => {
//     try {
//         const games = await getAllGames();
       
//         res.render('search', {
//             title: 'Search - Gaming Team',
//             games
//         });
//     } catch (err) {
//         console.error(err);
//         res.redirect('/search');
//     }
// });

// router.post('/search', async (req, res) => {
//     try {
//         const games = await findGameBySearch(req.body);
//         const body = req.body;
//         // console.log(body);
//         // { search: '', platform: 'Nintendo' }
        
//         body[req.body.platform.toLowerCase()] = true;
//         res.render('search', {
//             title: 'Search - Gaming Team',
//             games,
//             body
//         });
//     } catch (err) {
//         console.error(err);
//         res.redirect('/search');
//     }
// });




module.exports = router;


// router.post('/catalog/:id/bid', isAuth, async (req, res) => {
//     const productId = req.params.id;
//     const amount = Number(req.body.bidAmount);
    
//     try {
//         await placeBid(productId, amount, req.user._id);
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);
        
//     } finally {
//         res.redirect(`/catalog/${req.params.id}/details`);
//     }
// });



// router.get('/catalog/:id/close', isAuth, async (req, res) => {
//     const id = req.params.id;

//     try {
//         await closeAuction(id);
//         res.redirect('/profile');
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);

//         res.redirect(`/catalog/${req.params.id}/details`);

//     }
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.user._id);
//     // console.log(auctions);
    
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.session.user._id);
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const wishedBooksByUser = await getBookByUser(req.user._id);
//     // console.log(wishedBooksByUser);
//     // [
//     //     {
//     //       _id: new ObjectId("648091d0032c4e9b82cc7e62"),
//     //       title: 'Book 4 Study',
//     //       author: 'Peter Smart',
//     //       genre: 'Study',
//     //       stars: 5,
//     //       image: 'http://localhost:3000/static/image/book-4.png',
//     //       review: 'Study hard',
//     //       owner: new ObjectId("64806aec16e81be6c406baed"),
//     //       __v: 2,
//     //       usersWished: [ new ObjectId("64806822e1b2ccc415e315ef") ]
//     //     }
//     // ]

//     // Можем да добавим обекта в res.locals.името на обекта
//     // template profile -->> {{#each wishedBooks}}
//     res.locals.wishedBooks = wishedBooksByUser;
//     res.render('profile', { title: 'Profile Page'});

//     // or
//     // template profile -->> {#each user.wishedBooksByUser}}
//     // res.render('profile', {
//     //     title: 'Profile Page',
//     //     user: Object.assign({ wishedBooksByUser }, req.user)
//     // });
// });




// console.log(currGame);;
// {
//     _id: new ObjectId("647652253addd63fbb6d6f07"),
//     platform: 'PS5',
//     name: 'Mortal Kombat',
//     image: 'http://localhost:3000/static/images/mortal-kombat.png',
//     price: 250,
//     genre: 'Action',
//     description: 'Mortal Kombat fight game for adults',
//     owner: new ObjectId("6473c444cd9aad92fcefb5e3"),
//     __v: 0
// }


//----------------------------------------------------------------

// router.post('/edit/:id'...
// console.log(req.body);
// {
//     start: 'Sofia',
//     end: 'Pamporovo',
//     date: '21.05.2023',
//     time: '18:00',
//     carImage: 'https://mobistatic3.focus.bg/mobile/photosmob/711/1/big1/11684336382439711_41.jpg',
//     carBrand: 'Infinity',
//     seats: '3',
//     price: '35',
//     description: 'Ski trip for the weekend.'
// }