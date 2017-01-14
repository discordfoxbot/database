module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Guild', {
        id: {type: Sequelize.STRING(32), unique: true, allowNull: false, primaryKey: true, field: 'gid'},
        name: {type: Sequelize.TEXT, allowNull: false},
        region: {type: Sequelize.STRING, allowNull: false},
        icon: {type: Sequelize.STRING, allowNull: true},
        avability: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
        language: {type: Sequelize.STRING(5), defaultValue: 'en'},
        shard_id: {type: Sequelize.INTEGER.UNSIGNED},
        permission: {type: Sequelize.TEXT, allowNull: true},
        online: {type: Sequelize.BOOLEAN, defaultValue: true},

        modlog: {type: Sequelize.BOOLEAN, defaultValue: 0, allowNull: true},
        automod: {type: Sequelize.BOOLEAN, defaultValue: false},

        logging: {type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false},

        customtext_enabled: {type: Sequelize.BOOLEAN, defaultValue: false},
        customtext_prefix: {type: Sequelize.STRING(4), allowNull: false, defaultValue: '.'},


        //roles stuff
        regular_role: {type: Sequelize.STRING(32), allowNull: true},
        vip_role: {type: Sequelize.STRING(32), allowNull: true},
        moderator_role: {type: Sequelize.STRING(32), allowNull: true},
        manager_role: {type: Sequelize.STRING(32), allowNull: true},
        administrator_role: {type: Sequelize.STRING(32), allowNull: true},

        mute_role: {type: Sequelize.STRING(32), defaultValue: null, allowNull: true}
    }, {
        underscored: true,
        tableName: 'guilds'
    })
};