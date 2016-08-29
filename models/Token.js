module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Token', {
        token: {type: Sequelize.STRING(255), unique: true},
        type: {type: Sequelize.ENUM('user', 'system'), defaultValue: 'user'},
        expires: {type: Sequelize.DATE, defaultValue: null, allowNull: true}
    }, {
        underscored: true,
        tableName: 'tokens'
    })
};