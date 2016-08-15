module.exports = function (sequelize, Sequelize) {
    return sequelize.define('ChatFilter', {
        enabled:{type:Sequelize.BOOLEAN,defaultValue:false},
        ignore_role:{type:Sequelize.STRING(32)},
        links:{type:Sequelize.BOOLEAN,defaultValue:true},
        links_mode:{type:Sequelize.ENUM('whitelist','blacklist')},
        spam:{type:Sequelize.BOOLEAN,defaultValue:true},
        word_blacklist:{type:Sequelize.BOOLEAN,defaultValue:true}
    }, {
        underscored: true,
        tableName: 'chatfilters'
    })
};