const rp = require("request-promise");
const cheerio = require("cheerio");
const axios = require("axios");
const crypto = require("crypto");

const {
  save,
  getList,
  randomPick,
  updateToIsReadById,
  getOneById
} = require("./db/db");
module.exports = class TodoBot {
  constructor() {
    // this.prefix = ["http://", "https://"];
    this.api =
      "https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/sendMessage"; // wanda
  }
  checkIsUrl(text) {
    const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(text)) {
      return true;
    } else {
      return false;
    }
  }
  addIndices(todos) {
    return todos
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e, index) => {
        e.callback_data = e.uuid;
        console.log("TCL: TodoBot -> addIndices -> e.uuid", e.uuid);
        e.text = `${++index}. ${e.text}`;
        delete e.url;
        return [e];
      });
  }

  async sendToUser(chat_id, text, todos) {
    const option = {
      chat_id: chat_id,
      text
    };
    todos &&
      (option.reply_markup = {
        inline_keyboard: this.addIndices(todos)
      });

    await axios.post(this.api, option);
  }
  async getList(showUnread) {
    const queryResult = await getList(showUnread);
    return queryResult.Items;
  }
  async getOneById(id) {
    const queryResult = await getOneById(id);
    console.log("TCL: TodoBot -> getOneById -> id", id);
    console.log("TCL: TodoBot -> getOneById -> queryResult", queryResult);
    return queryResult;
  }
  async randomPick() {
    return await randomPick();
  }
  async updateToIsReadById(url) {
    return await updateToIsReadById(url);
  }
  async saveNewLink(url) {
    // if (
    //   !(
    //     url.substr(0, this.prefix[0].length) === this.prefix[0] ||
    //     url.substr(0, this.prefix[1].length) === this.prefix[1]
    //   )
    // ) {
    //   url = this.prefix[0] + url;
    // }
    const id = crypto.randomBytes(16).toString("hex");
    try {
      const text = await this.fetchTitle(url);
      if (text === "") throw error;
      const input = {
        uuid: id,
        url,
        text: text,
        is_read: 0,
        timestamp: Date.now()
      };
      console.log("TCL: TodoBot -> saveNewLink -> input", input);
      await save(input);
    } catch (error) {
      throw error;
    }
  }

  async fetchTitle(url) {
    try {
      const result = await rp(url);
      const $ = cheerio.load(result);

      const title = $("head > title")
        .text()
        .trim();
      console.log("TCL: TodoBot -> fetchTitle -> title", title);
      return title;
    } catch (error) {
      throw error;
    }
  }
};
