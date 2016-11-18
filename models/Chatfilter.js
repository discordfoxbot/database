module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Chatfilter', {
            id: {type: Sequelize.STRING(14), allowNull: false, primaryKey: true, unique: true},
            name: {type: Sequelize.STRING(32), allowNull: false},
            enabled: {type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false},
            config: {type: Sequelize.TEXT, allowNull: true}
        },
        {
            underscored: true,
            tableName: 'guildchatfilters'
        }
    )
};