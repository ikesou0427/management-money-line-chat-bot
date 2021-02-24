const { getPostgresClient } = require ("./postgres.js");

exports.disableUser = async function (user_id) {
    const db = await getPostgresClient();
    try {
        const sql = "UPDATE tb_users SET is_active = 0, date_disabled = CURRENT_DATE WHERE line_id = $1";
        const params = [user_id];

        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}