const GameModel = require('../models/GameModel');


async function getAllGames() {
    return GameModel.find({ }).lean();
    // return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

async function getProductAndBidsID(userId) {
    return GameModel.findById(userId).populate('owner').populate('bidder').lean();
}

async function getGameById(gameId) {
    return GameModel.findById(gameId).lean();

    // return await Book.findById(bookId).populate('usersLiked').lean();
    // .populate('usersLiked') -->> когато искаме да извадим масива с usersLiked (кои id-та са харесали пиесата)
}


async function createGame(gameData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията
    const pattern = new RegExp(`^${gameData.name}$`, 'i');
    const existing = await GameModel.findOne({ name: { $regex: pattern } });

    if (existing) {
        throw new Error('A Game with this name already exists');
    }

    const result = new GameModel(gameData);
    await result.save();
    return result;
}

async function editGame(gameId, editedGame) {
    const existing = await GameModel.findById(gameId);

    existing.platform = editedGame.platform;
    existing.name = editedGame.name;
    existing.image = editedGame.image;
    existing.price = editedGame.price;
    existing.genre = editedGame.genre;
    existing.description = editedGame.description;

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(gameId) {
    return GameModel.findByIdAndDelete(gameId);
}


async function buyGame(userId, gameId) {
    const game = await GameModel.findById(gameId);
    game.boughtBy.push(userId);
    return game.save();

    // same as
    // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
}

// Search  function from other tasks
async function search(name, platform) {
    let games = await GameModel.find({}).lean();

    if(name) {
        games = games.filter(x => x.name.toLowerCase() == name.toLowerCase())
        // x.name e името от games.name (от ляво)
        // от дясно name е това, което е подадето горе във функцията
    }

    if(platform) {
        games = games.filter(x => x.platform == platform);
        // x.platform e полето платформа от games.platform (от ляво)
        // от дясно platform е това, което е подадето горе във функцията
    }

    return games;
}



async function makeABidder(productId, userId) {
    const existing = await GameModel.findById(productId);

    if (existing.bidder.includes(userId)) {
        throw new Error('Cannot Bid twice');
    }

    existing.bidder.push(userId);
    return existing.save();
}

async function placeBid(productId, amount, userId) {
    const existingProduct = await GameModel.findById(productId);

    if (existingProduct.bidder == userId) {
        throw new Error('You are already the highest bidder');
    } else if (existingProduct.owner == userId) {
        throw new Error('You cannot bid for your own auction!');
    } else if (amount <= existingProduct.price) {
        throw new Error('Your bid must be higher than the current price');
    }

    existingProduct.bidder = userId;
    existingProduct.price = amount;

    await existingProduct.save();
}

async function closeAuction(id) {
    const existingProduct = await GameModel.findById(id);

    if (!existingProduct.bidder) {
        throw new Error('Cannot close auction without bidder!');
    }

    existingProduct.closed = true;
    await existingProduct.save();
}

async function getAuctionsByUser(userId) {
    return GameModel.find({ owner: userId, closed: true }).populate('bidder').lean();
}


module.exports = {
    createGame,
    getAllGames,
    getGameById,
    deleteById,
    editGame,
    buyGame,
    search
};






// async function sortByLikes(orderBy) {
//     return ProductModel.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
// }



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }






