const TodoBot = require("./todoBot");
const todoBot = new TodoBot();
const commands = ["all", "one", "list", "/start"];

//for Callback query (button clicked)
const action = async ({ data, message }) => {
  try {
    await todoBot.updateToIsRead(data);
    await todoBot.sendToUser(message.chat.id, data);
    return { statusCode: 200 };
  } catch (error) {
    console.log(error);
    return { statusCode: 400 };
  }
};

// return all list
const allList = async chat => {
  let replyMsg = "Here you go!";
  const queryResult = await todoBot.getList();
  if (!queryResult.length) replyMsg = "You have an empty list!";
  await todoBot.sendToUser(chat.id, replyMsg, queryResult);
  return;
};

// return unread list
const unreadList = async chat => {
  let replyMsg = "Here you go! -- Unread links";
  const queryResult = await todoBot.getList(true);
  if (!queryResult.length) replyMsg = "You have an empty list! -- Unread links";
  await todoBot.sendToUser(chat.id, replyMsg, queryResult);
  return;
};

// return random one
const one = async chat => {
  let replyMsg = "Feeling lucky!";
  const queryResult = await todoBot.randomPick();
  if (!queryResult.length) replyMsg = "You have an empty list!";
  await todoBot.sendToUser(chat.id, replyMsg, queryResult);
  return;
};

// for /start
const start = async chat => {
  let replyMsg = `
Please give me a link start with http:// or https://,
and I'll save it.

Available commands:
list  --  show unread links.
all   --  show all links.
one  --  randomly pick one link from unread links.

Enjoy!   By Casey
`;
  await todoBot.sendToUser(chat.id, replyMsg);
  return;
};

const route = async (commandIndex, chat) => {
  if (commandIndex === 0) {
    // all
    await allList(chat);
  } else if (commandIndex === 1) {
    // random one
    await one(chat);
  } else if (commandIndex === 2) {
    // unread
    await unreadList(chat);
  } else if (commandIndex === 3) {
    // /start
    await start(chat);
  }
};

const newUrl = async (url, chat) => {
  let replyMsg = "Successfully added!";
  try {
    await todoBot.saveNewLink(url);
  } catch (error) {
    replyMsg =
      "Failed to save the url, please try another url or try it again later.";
  }
  await todoBot.sendToUser(chat.id, replyMsg);
  return;
};

module.exports.shortbot = async event => {
  const body = JSON.parse(event.body);
  if (body.callback_query) return await action(body.callback_query);
  const { chat, text } = body.message;
  text = text.toLowerCase();
  console.log("TCL: body.message", body);
  const commandIndex = commands.indexOf(text);

  if (commandIndex === -1) {
    const isUrl = await todoBot.checkIsUrl(text);
    if (!isUrl) return { statusCode: 200 };
    await newUrl(text, chat);
  } else {
    await route(commandIndex, chat);
  }

  return { statusCode: 200 };
};
