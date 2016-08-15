module.exports = function (sequelize, Sequelize) {
    return sequelize.define('ChatFilterWords', {
        type:{type:Sequelize.ENUM('word','link')},
        setting:{type:Sequelize.ENUM('whitelist','blacklist')},
        content:{type:Sequelize.STRING}
    }, {
        underscored: true,
        tableName: 'chatfilterwords'
    })
};