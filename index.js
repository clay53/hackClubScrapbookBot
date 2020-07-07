const request = require('request');

const Discord = require('discord.js');
const client = new Discord.Client();

const TOKEN = process.env.TOKEN;

if (!process.env.TOKEN) {
    console.error("Must pass TOKEN as an environment variable!");
    process.exit();
}

const low = require('lowdb');
const { serialize } = require('lowdb/adapters/FileSync');
const db = low(new (require('lowdb/adapters/FileSync'))(__dirname + '/db.json'));

db.defaults({channels: {}}).write();

client.on('ready', () => {
    console.log(`Hey, it's ya boiiii ${client.user.tag}`);
    client.user.setActivity("!scrapbook");
});

client.on('message', msg => {
    if (msg.content.startsWith("!scrapbook")) {
        var parts = msg.content.split(' ');

        if (parts.length === 1 || parts[1].toLowerCase() === "help") {
            msg.channel.send(
                "prefix: !scrapbook\n" +
                "help - Displays list of commands\n" +
                "start <username> - sync a user's scrapbook post to active channel\n" +
                "stop - stops syncing current user in channel\n" +
                "notify <@role> - notify specific role of new posts\n" +
                "nonotify - stop notifications"
            );
            return;
        }

        switch(parts[1].toLowerCase()) {
            case ("add")
            case ("start"):
                if (parts.length === 3) {
                    if (msg.member) {
                        if (msg.member.hasPermission("ADMINISTRATOR")) {
                            if (parts[2].length > 0) {
                                if (!db.has(`channels.${msg.channel.id}`).value()) {
                                    db.set(`channels.${msg.channel.id}`, {
                                        username: parts[2],
                                        lastId: ""
                                    }).write();
                                    
                                    msg.reply("Starting sync...");
                                } else {
                                    msg.reply(`this channel is already syncing \`${db.get(`channels.${msg.channel.id}.username`).value()}\` run \`!scrapbook stop\` to sync a new user.`);
                                }
                            } else {
                                msg.reply("invalid username");
                            }
                        } else {
                            msg.reply("only administrators may start syncing.");
                        }
                    } else {
                        msg.reply("couldn't get member status of user. This is usually caused by the command being run in a DM which is unsupported.");
                    }
                } else {
                    msg.reply("start command requires 1 option (user).");
                }
                return;
            case ("notify"):
                if (!msg.guild) return msg.reply("notify can only be called from in a guild.");
                if (parts.length !== 3) return msg.reply("notify commpand requires 1 option (role).");
                if (!msg.member) return msg.reply("couldn't get member status of user. This is usually caused by the command being run in a DM which is unsupported.");
                if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("only administrators may set notification role.");
                if (!db.has(`channels.${msg.channel.id}`).value()) return msg.reply("must have already started scrapbook in this channel.");

                if (parts[2].length !== 22) return (msg.reply("failed to get role id. Did you provide a valid role?"));

                let roleId = parts[2].substr(3, 18);

                msg.guild.roles.fetch(roleId).then(role => {
                    if (role === null) return msg.reply("role does not exist.");
                    db.set(`channels.${msg.channel.id}.notify`, roleId).write();
                    msg.reply(`now notifying @ ${role.name} of new scrapbook posts!`);
                }).catch(err => {
                    msg.reply("failed to fetch role.");
                    console.error("Failed to fetch role ", err);
                });
                return;
            case ("nonotify"):
                if (!msg.guild) return msg.reply("nonotify can only be called from in a guild.");
                if (!msg.member) return msg.reply("couldn't get member status of user. This is usually caused by the command being run in a DM which is unsupported.");
                if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("only administrators may set notification role.");
                if (!db.has(`channels.${msg.channel.id}`).value()) return msg.reply("must have already started scrapbook in this channel.");
                if (!db.has(`channels.${msg.channel.id}.notify`).value()) return msg.reply("can't stop notifications if no one is being notified.");

                db.unset(`channels.${msg.channel.id}.notify`).write();
                msg.reply("stopped notifications for this channel.");
                return;
            case ("test"):
                if (!msg.member) return msg.reply("couldn't get member status of user. This is usually caused by the command being run in a DM which is unsupported.");
                if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("only administrators may send test posts.");
                if (!db.has(`channels.${msg.channel.id}`).value()) return msg.reply("must have already started scrapbook in this channel.");

                sendPost(msg.channel, {
                    text: "This is a test post!",
                    attachments: [
                        {
                            url: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                        }
                    ]
                })
                return;
            case ("stop"):
                if (msg.member) {
                    if (msg.member.hasPermission("ADMINISTRATOR")) {
                        if (db.has(`channels.${msg.channel.id}`).value()) {
                            db.unset(`channels.${msg.channel.id}`).write();
                            msg.reply("stopped syncing this channel.");
                        } else {
                            msg.reply("not syncing any user.");
                        }
                    } else {
                        msg.reply("only administrators may stop syncing.");
                    }
                } else {
                    msg.reply("couldn't get member status of user. This is usually caused by the command being run in a DM which is unsupported.");
                }
                return;
        }
    }
});

// Sync channels
setInterval(() => {
    request('https://scrapbook.hackclub.com/api/posts', {json: true}, (err, res, body) => {
        if (!err) {
            console.log("Updating...");
            var updatedChannelCount = 0;

            let channels = db.get('channels').value();
            var searchChannelIds = Object.keys(channels);
            for (let i = 0; i < body.length && searchChannelIds.length > 0; i++) {
                for (let j = 0; j < searchChannelIds.length; j++) {
                    let channelId = searchChannelIds[j];
                    let channel = channels[channelId];

                    let post = body[i];

                    if (channel.username === post.user.username) {
                        if (channel.lastId !== post.id) {
                            updatedChannelCount++;
                            client.channels.fetch(channelId).then(c => {
                                sendPost(c, post);
                            }).catch(err => {
                                if (err.code === 10003 || err.code === 50001) {
                                    console.log(`Channel ${channelId} is inaccessible, removing...`);
                                    db.unset(`channels.${channelId}`).write();
                                } else {
                                    console.error(`Failed to fetch channel ${channelId}`, err);
                                }
                            });
                            db.set(`channels.${channelId}.lastId`, post.id).write();
                        }

                        searchChannelIds.splice(j, 1);
                        j--;
                    }
                }
            }
            console.log(`Updated ${updatedChannelCount} channels!`);
        } else {
            console.error("Failed to get scrapbook posts", body);
        }
    })
}, 20000);

function sendPost(channel, post) {
    channel.send(
        `${db.has(`channels.${channel.id}.notify`).value() ? `<@&${db.get(`channels.${channel.id}.notify`).value()}> ` : ''}${post.text}`,
        {
            files: post.attachments.map(file => file.url)
        }
    );
}

client.login(TOKEN);