var Sequelize = require('sequelize');
var Redis = require('ioredis');
var storyboard = require('storyboard');
var EventEmitter = require('events');
var shortid = require('shortid');
var path = require('path');
var Cron = require('cron').CronJob;
var moment = require('moment');

class DB extends EventEmitter {
    constructor(config) {
        super();
        var that = this;
        config.sequelize.options.logging = (toLog)=> {
            that.emit('sqllog', toLog);
        };
        this.config = config;
        this.sequelize = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, config.sequelize.options);
        this.messageDB = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, config.sequelize.options);
        this.sub = new Redis(config.redis);
        this.redis = new Redis(config.redis);
        this.models = {
            Guild: this.sequelize.import(path.join(__dirname, 'models', 'Guild')),
            User: this.sequelize.import(path.join(__dirname, 'models', 'User')),
            GuildRole: this.sequelize.import(path.join(__dirname, 'models', 'GuildRole')),
            GuildFeature: this.sequelize.import(path.join(__dirname, 'models', 'GuildFeature')),
            Prefix: this.sequelize.import(path.join(__dirname, 'models', 'Prefix')),
            TwitchChannel: this.sequelize.import(path.join(__dirname, 'models', 'TwitchChannel')),
            TwitchWatcher: this.sequelize.import(path.join(__dirname, 'models', 'TwitchWatcher')),
            Character: this.sequelize.import(path.join(__dirname, 'models', 'Character')),
            CharacterPicture: this.sequelize.import(path.join(__dirname, 'models', 'CharacterPicture')),
            Message: this.messageDB.import(path.join(__dirname, 'models', 'Message')),
            ProxerAnime: this.sequelize.import(path.join(__dirname, 'models', 'ProxerAnime')),
            ProxerWatcher: this.sequelize.import(path.join(__dirname, 'models', 'ProxerWatcher')),
            Channel: this.sequelize.import(path.join(__dirname, 'models', 'Channel')),
            ChatLog: this.sequelize.import(path.join(__dirname, 'models', 'ChatLog')),
            ChatLogMessage: this.sequelize.import(path.join(__dirname, 'models', 'ChatLogMessage')),
            Picture: this.sequelize.import(path.join(__dirname, 'models', 'Picture')),
            ChatFilter: this.sequelize.import(path.join(__dirname, 'models', 'ChatFilter')),
            ChatFilterWord: this.sequelize.import(path.join(__dirname, 'models', 'ChatFilterWord')),
            StatusMessage: this.sequelize.import(path.join(__dirname, 'models', 'StatusMessage')),
            VCSFeed: this.sequelize.import(path.join(__dirname, 'models', 'VCSFeed')),
            Token: this.sequelize.import(path.join(__dirname, 'models', 'Token'))
        };

        this.models.Guild.belongsTo(this.models.User, {as: 'Owner'});
        this.models.Guild.hasMany(this.models.GuildRole);
        this.models.Guild.belongsToMany(this.models.Prefix, {through: 'GuildPrefixes'});
        this.models.Guild.hasMany(this.models.ProxerWatcher);
        this.models.Guild.hasMany(this.models.TwitchWatcher);
        this.models.Guild.hasMany(this.models.Channel);
        this.models.Guild.hasMany(this.models.GuildFeature);
        this.models.Guild.hasOne(this.models.ChatFilter);
        this.models.Guild.belongsToMany(this.models.User, {through: 'GuildMember'});
        this.models.Guild.belongsToMany(this.models.Token, {through: 'Tokens'});

        this.models.GuildFeature.belongsTo(this.models.Guild);

        this.models.User.hasMany(this.models.Guild, {as: 'OwnedGuilds'});
        this.models.User.hasMany(this.models.GuildRole);
        this.models.User.belongsToMany(this.models.Guild, {through: 'GuildMember'});
        this.models.User.hasMany(this.models.Token);

        this.models.GuildRole.belongsTo(this.models.Guild);
        this.models.GuildRole.belongsTo(this.models.User);
        this.models.User.belongsTo(this.models.Character, {as: 'Waifu'});
        this.models.User.belongsTo(this.models.Character, {as: 'Husbando'});

        this.models.Prefix.belongsToMany(this.models.Guild, {through: 'GuildPrefixes'});

        this.models.TwitchWatcher.belongsTo(this.models.Guild);
        this.models.TwitchWatcher.belongsTo(this.models.TwitchChannel);

        this.models.TwitchChannel.hasMany(this.models.TwitchWatcher);

        this.models.ProxerWatcher.belongsTo(this.models.ProxerAnime);
        this.models.ProxerWatcher.belongsTo(this.models.Guild);

        this.models.ProxerAnime.hasMany(this.models.ProxerWatcher);

        this.models.Character.hasMany(this.models.CharacterPicture);

        this.models.CharacterPicture.belongsTo(this.models.Character);

        this.models.ChatLog.belongsToMany(this.models.ChatLogMessage, {through: 'LogMessages'});
        this.models.ChatLog.belongsTo(this.models.User);
        this.models.ChatLog.belongsTo(this.models.Guild);
        this.models.ChatLog.belongsTo(this.models.Channel);

        this.models.ChatLogMessage.belongsToMany(this.models.ChatLog, {through: 'LogMessages'});
        this.models.ChatLogMessage.belongsTo(this.models.User);

        this.models.Channel.belongsTo(this.models.Guild);
        this.models.Channel.hasMany(this.models.ChatLog);
        this.models.Channel.hasOne(this.models.VCSFeed);

        this.models.ChatFilter.belongsTo(this.models.Guild);
        this.models.ChatFilter.hasMany(this.models.ChatFilterWord);

        this.models.ChatFilterWord.belongsTo(this.models.ChatFilter);

        this.models.VCSFeed.belongsTo(this.models.Channel);

        this.models.Token.belongsToMany(this.models.Guild, {through: 'Tokens'});
        this.models.Token.belongsTo(this.models.User);

        this.sequelize.sync();
        this.messageDB.sync();

        this.sid = shortid.generate();
        this.sub.subscribe(config.pubsub_prefix + 'events');
        this.sub.on('message', (channel, message)=> {
            if (channel === config.pubsub_prefix + 'events') {
                try {
                    var data = JSON.parse(message);
                    if (data.sid !== that.sid) {
                        that.emit(data.type, data.data || {});
                    }
                } catch (e) {
                    that.emit('pubsub_error', {msg: 'Error handling message', err: {error: e, msg: message}});
                }
            } else that.emit('message', channel, msg);
        });

        this.crons = {};
        if (config.useCrons) {
            this.crons.msg = new Cron('0 0 0,6,12,18 * * *', function () {
                that.models.Message.destroy({where: {created_at: {$lt: moment().subtract(3, 'days').toDate()}}}).then(function (msgs) {
                    that.emit('sqllog', 'Deleted ' + msgs + ' messages from the DB')
                });
            }, null, true);
        }
    }

    publish(channel, message) {
        return this.redis.publish(this.config.pubsub_prefix + channel, message);
    }

    subscribe(channel) {
        return this.sub.subscribe(this.config.pubsub_prefix + channel);
    }

    sendEvent(event, data) {
        this.redis.publish(this.config.pubsub_prefix + 'events', JSON.stringify({
            type: event,
            data: data || {},
            sid: this.sid
        }));
    }

    sendSelf(event, data) {
        this.emit(event, data || {});
    }
}

module.exports = DB;