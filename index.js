const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, 
    channelSecret: process.env.LINE_CHANNEL_SECRET 
};

const line = require ("@line/bot-sdk");
const bot = new line.Client (line_config);

const message_text = require ("./app/message_text.js");
const follow = require ("./app/follow.js");
const unfollow = require ("./app/unfollow.js");

const server = require ("express")();
server.listen (process.env.PORT || 3000);
server.post ('/webhook', line.middleware (line_config), async function (req, res) {
    res.sendStatus(200);

    const user_id = req.body.events[0].source.userId;

    req.body.events.forEach(async (event) => {
        switch (event.type) {
            case "message":
                if (event.message.type === "text") {
                    const func_to_run = message_text.getFunc2RunAndArgs (event.message.text);
                    const reply_text = await func_to_run.do(user_id, func_to_run.args);
                    bot.replyMessage(event.replyToken, {
                        type: "text",
                        text: reply_text
                    });
                }
                else if (event.message.type === "sticker") {

                }
                break;
            case "follow": 
                const user_name = (await bot.getProfile(user_id)).displayName;
                follow.registerUser(user_id, user_name);
                bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "登録してくれてありがとう！"
                });
                break;
            case "unfollow":
                unfollow.disableUser(user_id);
                break;
            default:
                bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "未実装の処理"
                });
        }
    })
});