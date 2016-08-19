module.exports = function (sequelize, Sequelize) {
    return sequelize.define('GithubFeed', {
        id: {type: Sequelize.STRING(14), unique: true, primaryKey:true},
        last_event:{type:Sequelize.STRING(191)},
        repository_name:{type:Sequelize.STRING(191)},
        repository_id:{type:Sequelize.STRING(32)},
        repository_owner:{type:Sequelize.STRING(191)},
        repository_owner_id:{type:Sequelize.STRING(32)}
    }, {
        underscored: true,
        tableName: 'githubfeeds'
    })
};