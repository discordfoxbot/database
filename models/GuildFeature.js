module.exports = function (sequelize, Sequelize) {
    return sequelize.define('GuildFeature', {
            id: {type: Sequelize.STRING(14), allowNull: false, primaryKey: true, unique: true},
            name: {type: Sequelize.STRING(32), allowNull: false},
            enabled: {type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false},
            meta: {type: Sequelize.STRING(100), allowNull: true}
        },
        {
            underscored: true,
            tableName: 'guildfeatures'
        }
    )
};