module.exports = function (sequelize, Sequelize) {
    return sequelize.define('StatusMessage', {
        enabled:{type:Sequelize.BOOLEAN,defaultValue:true},
        message:{type:Sequelize.STRING(64),allowNull:false}
    }, {
        underscored: true,
        tableName: 'statusmessages'
    })
};