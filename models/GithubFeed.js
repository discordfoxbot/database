module.exports = function (sequelize, Sequelize) {
    return sequelize.define('GithubFeed', {
        id: {type: Sequelize.STRING(14), unique: true, primaryKey:true}
    }, {
        underscored: true,
        tableName: 'githubfeeds'
    })
};