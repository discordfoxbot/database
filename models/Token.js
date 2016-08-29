module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Token', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: False, autoIncrement: true, primaryKey: true},
        token: {type: Sequelize.STRING(255), unique: true},
        type: {type: Sequelize.ENUM('user', 'system'), defaultValue: 'user'},
        expires: {type: Sequelize.DATE, defaultValue: null, allowNull: true}
    }, {
        underscored: true,
        tableName: 'tokens'
    })
};