const GameModel = require('../models/GameModel');



async function getAllByDate(search) {
    const query = {};
    if (search) {
        query.title = new RegExp(search, 'i');
    } 
    
    return GameModel.find(query).sort({ createdAt: 1 }).lean();
    
}

async function getRecent() {
    return GameModel.find({}).sort({ userCount: -1 }).limit(3).lean();
}


// Search for template search_2.hbs
async function findGameBySearch({ search, platform }) {
    const games = await GameModel
        .find({
            name: { $regex: search, $options: 'i' },
            platform: { $regex: platform, $options: 'i' }
        })
        .lean();
    return games;
}



// 100% working
async function search (gameText, gamePlat) {
    if (gameText) {
        return (GameModel.find({ name: { $regex: gameText, $options: 'i' } }).lean());
    }

    if (!gameText && gamePlat) {
        return (GameModel.find({ platform: gamePlat }).lean());
    }

}


module.exports = {
    getAllByDate,
    getRecent,
    findGameBySearch,
    search
};
