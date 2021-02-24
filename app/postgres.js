const pg = require ("pg");
const config = require ("config");
const pool = new pg.Pool (config.db.postgres);
// https://qiita.com/masaks/items/3ee1b5a06a95315a7ae7 こちらを利用しました

/**
 * Postgresクラス
 */
class Postgres {

    /**
     * Poolからclientを取得
     * @return {Promise<void>}
     */
    async init() {
        this.client = await pool.connect();
    }

    /**
     * SQLを実行
     * @param query
     * @param params
     * @return {Promise<*>}
     */
    async execute(query, params = []) {
        return await this.client.query(query, params);
    }
    
    /**
     * 取得したクライアントを解放してPoolに戻す
     * @return {Promise<void>}
     */
    async release() {
        await this.client.release(true);
    }

    /**
     * Transaction Begin
     * @return {Promise<void>}
     */
    async begin() {
        await this.client.query('BEGIN');
    }

    /**
     * Transaction Commit
     * @return {Promise<void>}
     */
    async commit() {
        await this.client.query('COMMIT');
    }

    /**
     * Transaction Rollback
     * @return {Promise<void>}
     */
    async rollback() {
        await this.client.query('ROLLBACK');
    }
}

/**
 * Postgresのインスタンスを返却
 * @return {Promise<Postgres>}
 */
const getClient = async () => {
    const postgres = new Postgres();
    await postgres.init();
    return postgres;
};

module.exports.getPostgresClient = getClient;