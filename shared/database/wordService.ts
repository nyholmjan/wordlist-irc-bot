import type { Client } from "@elastic/elasticsearch/api/new";

type Source = {
  value: string;
  nick: string;
};

export default class WordService {
  private fuzziness = 1;
  private analyzer = "finnish";
  private client;
  private indexName =
    process.env.ELASTIC_SEARCH_INDEX_NAME || "paska-lista";

  constructor(client: Client) {
    this.client = client;
  }

  public async get(value: string) {
    const { body } = await this.client.search<Source>({
      index: this.indexName,
      body: {
        query: {
          match: {
            value: {
              query: value
            },
          },
        },
      },
    });

    return body.hits.hits;
  }

  public async matchAll(text: string) {
    const { body } = await this.client.search<Source>({
      index: this.indexName,
      body: {
        query: {
          match: {
            value: {
              query: text,
              fuzziness: this.fuzziness,
              analyzer: this.analyzer,
            },
          },
        },
      },
    });

    const results = body.hits.hits;
    return results.map((hit) => hit._source?.value);
  }

  public async getAll() {
    const result = await this.client.search<Source>({
      index: this.indexName,
    });
    return result.body.hits.hits.map((hit) => hit._source?.value);
  }

  public async add(word: string, nick: string) {
    const existing = await this.get(word)
    if (existing.length > 0) {
      throw new Error("Word exists")
    }
    const response = await this.client.index<Source>({
      index: this.indexName,
      refresh: true,
      body: {
        nick: nick,
        value: word,
      },
    });
    if (
      response.body.result === "created" ||
      response.body.result === "updated"
    ) {
      return word;
    } else {
      throw new Error("Failed to add or update word");
    }
  }

  public async delete(word: string) {
    const result = await this.client.deleteByQuery<Source>({
      index: this.indexName,
      body: { query: { match: { value: word } } },
    });
    if (result.body.deleted === 0) {
      throw new Error(`Unable to delete word. Word "${word}" not found`);
    }
    return word;
  }
}
