const { getPostgresClient } = require ("./postgres.js");

exports.registerUser = async function (user_id, user_name) {
    const db = await getPostgresClient();
    try {
        const sql = ` 
            INSERT INTO tb_users (line_id, user_name, is_active, date_created)
                VALUES ($1, $2, -1, CURRENT_DATE)
                ON CONFLICT (line_id)
                DO UPDATE SET user_name = $2, is_active = -1, date_disabled = NULL`;
        const params = [user_id, user_name];

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