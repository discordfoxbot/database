module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Picture', {
        id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, autoIncrement: true, primaryKey: true},
        link: {type: Sequelize.STRING(191), allowNull: false, unique: true},
        type: {type: Sequelize.ENUM('cat', 'wtf', 'smile')},
        original_link: {type: Sequelize.STRING(191), unique: true},
        verified: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
    }, {
        underscored: true,
        tableName: 'pictures'
    })
};