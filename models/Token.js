module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Token', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true},
        token: {type: Sequelize.STRING(255), unique: true},
        type: {type: Sequelize.ENUM('user', 'system', 'application'), defaultValue: 'user'},
        level: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        query_limit: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 100, allowNull: false},
        expires: {type: Sequelize.DATE, defaultValue: null, allowNull: true}
    }, {
        underscored: true,
        tableName: 'tokens'
    })
};