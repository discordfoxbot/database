let Sequelize = require('sequelize'),
    Redis = require('ioredis'),
    storyboard = require('storyboard'),
    EventEmitter = require('events'),
    shortid = require('shortid'),
    path = require('path'),
    Cron = require('cron').CronJob,
    moment = require('moment');

class DB extends EventEmitter {
    /** @namespace config.useCrons */
    /** @namespace this.config.pubsub_prefix */
    constructor(config) {
        super();
        config.sequelize.options.logging = (toLog) => {
            this.emit('sqllog', toLog);
        };
        this.config = config;
        this.sequelize = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, config.sequelize.options);
        this.messageDB = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, config.sequelize.options);
        this.sub = new Redis(config.redis);
        this.redis = new Redis(config.redis);
        this.models = {
            Guild: this.sequelize.import(path.join(__dirname, 'models', 'Guild')),
            Chatfilter: this.sequelize.import(`${__dirname}/models/Chatfilter`),
            User: this.sequelize.import(path.join(__dirname, 'models', 'User')),
            GuildRole: this.sequelize.import(path.join(__dirname, 'models', 'GuildRole')),
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
            StatusMessage: this.sequelize.import(path.join(__dirname, 'models', 'StatusMessage')),
            VCSFeed: this.sequelize.import(path.join(__dirname, 'models', 'VCSFeed')),
            Token: this.sequelize.import(path.join(__dirname, 'models', 'Token'))
        };

        this.models.Guild.belongsTo(this.models.User, {as: 'Owner'});
        this.models.Guild.hasMany(this.models.GuildRole);
        //noinspection JSCheckFunctionSignatures
        this.models.Guild.belongsToMany(this.models.Prefix, {through: 'GuildPrefixes'});
        this.models.Guild.hasMany(this.models.ProxerWatcher);
        this.models.Guild.hasMany(this.models.TwitchWatcher);
        this.models.Guild.hasMany(this.models.Channel);
        this.models.Guild.hasOne(this.models.Chatfilter);
        //noinspection JSCheckFunctionSignatures
        this.models.Guild.belongsToMany(this.models.User, {through: 'GuildMember'});
        //noinspection JSCheckFunctionSignatures
        this.models.Guild.belongsToMany(this.models.Token, {through: 'ApiTokens'});

        this.models.User.hasMany(this.models.Guild, {as: 'OwnedGuilds'});
        this.models.User.hasMany(this.models.GuildRole);
        //noinspection JSCheckFunctionSignatures
        this.models.User.belongsToMany(this.models.Guild, {through: 'GuildMember'});
        this.models.User.hasMany(this.models.Token);
        this.models.User.belongsTo(this.models.Character, {as: 'Waifu'});
        this.models.User.belongsTo(this.models.Character, {as: 'Husbando'});

        this.models.GuildRole.belongsTo(this.models.Guild);
        this.models.GuildRole.belongsTo(this.models.User);

        //noinspection JSCheckFunctionSignatures
        this.models.Prefix.belongsToMany(this.models.Guild, {through: 'GuildPrefixes'});

        this.models.TwitchWatcher.belongsTo(this.models.Guild);
        this.models.TwitchWatcher.belongsTo(this.models.TwitchChannel);

        this.models.TwitchChannel.hasMany(this.models.TwitchWatcher);

        this.models.ProxerWatcher.belongsTo(this.models.ProxerAnime);
        this.models.ProxerWatcher.belongsTo(this.models.Guild);

        this.models.ProxerAnime.hasMany(this.models.ProxerWatcher);

        this.models.Character.hasMany(this.models.CharacterPicture);

        this.models.CharacterPicture.belongsTo(this.models.Character);

        //noinspection JSCheckFunctionSignatures
        this.models.ChatLog.belongsToMany(this.models.ChatLogMessage, {through: 'LogMessages'});
        this.models.ChatLog.belongsTo(this.models.User);
        this.models.ChatLog.belongsTo(this.models.Guild);
        this.models.ChatLog.belongsTo(this.models.Channel);

        //noinspection JSCheckFunctionSignatures
        this.models.ChatLogMessage.belongsToMany(this.models.ChatLog, {through: 'LogMessages'});
        this.models.ChatLogMessage.belongsTo(this.models.User);

        this.models.Channel.belongsTo(this.models.Guild);
        this.models.Channel.hasMany(this.models.ChatLog);
        this.models.Channel.hasOne(this.models.VCSFeed);

        this.models.Chatfilter.belongsTo(this.models.Guild);

        this.models.VCSFeed.belongsTo(this.models.Channel);

        //noinspection JSCheckFunctionSignatures
        this.models.Token.belongsToMany(this.models.Guild, {through: 'ApiTokens'});
        this.models.Token.belongsTo(this.models.User);

        this.sequelize.sync();
        this.messageDB.sync();

        this.sid = shortid.generate();
        this.sub.subscribe(config.pubsub_prefix + 'events');
        this.sub.on('message', (channel, message) => {
            if (channel === config.pubsub_prefix + 'events') {
                try {
                    let data = JSON.parse(message);
                    if (data.sid !== this.sid) {
                        this.emit(data.type, data.data || {});
                    }
                } catch (e) {
                    this.emit('pubsub_error', {msg: 'Error handling message', err: {error: e, msg: message}});
                }
            } else this.emit('message', channel, msg);
        });

        this.crons = {};
        if (config.useCrons) {
            this.crons.msg = new Cron('0 0 0,6,12,18 * * *', function () {
                //noinspection JSUnresolvedFunction
                this.models.Message.destroy({where: {created_at: {$lt: moment().subtract(3, 'days').toDate()}}}).then(function (msgs) {
                    this.emit('sqllog', 'Deleted ' + msgs + ' messages from the DB')
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

    //noinspection JSUnusedGlobalSymbols
    sendEvent(event, data) {
        this.redis.publish(this.config.pubsub_prefix + 'events', JSON.stringify({
            type: event,
            data: data || {},
            sid: this.sid
        }));
    }

    //noinspection JSUnusedGlobalSymbols
    sendSelf(event, data) {
        this.emit(event, data || {});
    }
}

module.exports = DB;