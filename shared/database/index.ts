import WordService from "./wordService";
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: `${process.env.ELASTIC_SEARCH_HOST}:${process.env.ELASTIC_SEARCH_PORT}`,
});

const wordService = new WordService(client);

export { wordService };
