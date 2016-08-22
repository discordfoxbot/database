module.exports = function (sequelize, Sequelize) {
    return sequelize.define('VCSFeed', {
        id: {type: Sequelize.STRING(14), unique: true, primaryKey: true},
        last_gh_event: {type: Sequelize.STRING(191)},
        last_gl_event: {type: Sequelize.STRING(191)}
    }, {
        underscored: true,
        tableName: 'githubfeeds'
    })
};