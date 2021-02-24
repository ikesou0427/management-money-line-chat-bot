const { getPostgresClient } = require ("./postgres.js");

const newAction = async function (line_id, {item , price = "0"}) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = "INSERT INTO tb_contents (line_id, title, price) VALUES ($1, $2, $3)";
    try {
        if (/^\d+$/.test(price) === false) {
            price = 0;
        }
        const params = [line_id, item, Number(price)];

        await db.begin();
        await db.execute(sql, params);
        await db.commit();
        output_text = item + "を追加しました。";
    } catch (error) {
        if (error.code == "23505") {
            output_text = item + "はすでに存在しています。";
        } 
        else {
            console.log(error)
            output_text = "未実装のエラー処理。ゆるせちょんまげ";
        }
        await db.rollback();
    } finally {
        await db.release();
    }
    return output_text;
}

const deleteAction = async function (line_id, {item}) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = "DELETE FROM tb_contents WHERE line_id = $1 AND title = $2";

    try {
        const params = [line_id, item];

        await db.begin();
        await db.execute(sql, params);
        await db.commit();
        output_text = item + "を削除しました。";
    } catch (error) {
        output_text = "未実装のエラー処理。ゆるせちょんまげ";
        await db.rollback();
    } finally {
        await db.release();
    }
    return output_text;
}

const moveAction = async function (line_id, {source_item, target_item, price_moved = "0"}) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = `UPDATE tb_contents 
                    SET price = CASE 
                        WHEN line_id = $1 AND title = $2 THEN price - $4
                        WHEN line_id = $1 AND title = $3 THEN price + $4
                    END
                WHERE title IN ($2, $3)`;
    try {
        if (/^\d+$/.test(price_moved) === false) {
            price_moved = 0;
        }
        const params = [line_id, source_item, target_item, Number(price_moved)];

        await db.begin();
        const result = await db.execute(sql, params);
        if (result.rowCount != 2) {
            throw "InValidItemException";
        }
        await db.commit();
        output_text = source_item + "から" + target_item + "へ" + price_moved + "円移動しました。";
    } catch (error) {
        if (error === "InValidItemException") {
            output_text = "入力された項目名が存在しません。";
        } 
        else {
            console.log(error)
            output_text = "未実装のエラー処理。ゆるせちょんまげ";
        }
        await db.rollback();
    } finally {
        await db.release();
    }
    return output_text;
}

const listAction = async function (line_id) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = "SELECT title, price FROM tb_contents WHERE line_id = $1";

    try {
        const params = [line_id];

        const result = await db.execute (sql, params);
        result.rows.forEach ((row, index) => output_text += row.title + " : " + row.price + "円\n");
        const total = result.rows.reduce ((total, row) => total += row.price, 0);
        output_text += "合計 : " + total + "円";
    } catch (error) {
        output_text = "未実装のエラー処理。ゆるせちょんまげ";
    } finally {
        await db.release();
    }
    return output_text;
}

const helpAction = function () {
    const output_text = `コマンド一覧
new  [項目] [金額] 項目の追加
del  [項目]  項目の削除
move [移動元項目] [移動先項目] [金額] 指定金額を移動
list 全ての項目の表示
help ヘルプメニューの表示
chg  [項目] [金額] 金額の変更
add  [項目] [金額] 値の加算
sub  [項目] [金額] 値の減算`;
    return output_text;
}

const changeAction = async function (line_id, {item, price = "0"}) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = "UPDATE tb_contents SET price = $3 WHERE line_id = $1 AND title = $2";
    try {
        if (/^\d+$/.test(price) === false) {
            price = 0;
        }
        const params = [line_id, item, Number(price)];

        await db.begin();
        const result = await db.execute(sql, params);
        if (result.rowCount === 0) {
            throw "InValidItemException";
        }
        await db.commit();
        output_text = item + "の金額を" + price  + "円に変更しました。";
    } catch (error) {
        if (error == "InValidItemException") {
            output_text = item + "が存在しません。";
        } 
        else {
            console.log(error);
            output_text = "未実装のエラー処理。ゆるせちょんまげ";
        }
        await db.rollback();
    } finally {
        await db.release();
    }
    return output_text;
}

const addAction = async function (line_id, {item, price = "0"}) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = "UPDATE tb_contents SET price = price + $3 WHERE line_id = $1 AND titie = $2";
    try {
        if (/^\d+$/.test(price) === false) {
            price = 0;
        }
        const params = [line_id, item, Number(price)];

        await db.begin();
        const result = await db.execute(sql, params);
        if (result.rowCount === 0) {
            throw "InValidItemException";
        }
        await db.commit();
        output_text = item + "に" + price + "円追加しました。";
    } catch (error) {
        if (error == "InValidItemException") {
            output_text = item + "が存在しません。";
        } 
        else {
            console.log(error);
            output_text = "未実装のエラー処理。ゆるせちょんまげ";
        }
        await db.rollback();
    } finally {
        await db.release();
    }
    return output_text;
}

const subtractAction = async function (line_id, {item, price = "0"}) {
    const db = await getPostgresClient();
    let output_text = "";
    const sql = "UPDATE tb_contents SET price = price - $3 WHERE line_id = $1 AND titie = $2";
    try {
        if (/^\d+$/.test(price) === false) {
            price = 0;
        }
        const params = [line_id, item, Number(price)];

        await db.begin();
        const result = await db.execute(sql, params);
        if (result.rowCount === 0) {
            throw "InValidItemException";
        }
        await db.commit();
        output_text = item + "から" + price + "円差し引きました。";
    } catch (error) {
        if (error == "InValidItemException") {
            output_text = item + "が存在しません。";
        } 
        else {
            console.log(error);
            output_text = "未実装のエラー処理。ゆるせちょんまげ";
        }
        await db.rollback();
    } finally {
        await db.release();
    }
    return output_text;
}

exports.getFunc2RunAndArgs = function (input_text) {
    const func_to_run = {do : function(){} , args : {}};
    const command = input_text.split(" ")[0];
    switch (command) {
        case "new" :
            func_to_run.do = newAction;
            [,item, price] = input_text.split(" ");
            func_to_run.args = {item, price};
            break;
        case "del" :
        case "delete" :
            //TODO 削除前に確認をする
            func_to_run.do = deleteAction;
            item = input_text.split(" ")[1];
            func_to_run.args = {item};
            break;
        case "mv" :
        case "move" :
            func_to_run.do = moveAction;
            [, source_item, target_item, price_moved] = input_text.split(" ");
            func_to_run.args = {source_item, target_item, price_moved};
            break;
        case "list" :
            func_to_run.do = listAction;
            break;
        case "help" :
            func_to_run.do = helpAction;
            break;
        case "chg" :
        case "change" :
            func_to_run.do = changeAction;
            [,item, price] = input_text.split(" ");
            func_to_run.args = {item, price};
            break;
        case "add" :
            func_to_run.do = addAction;
            [,item, price] = input_text.split(" ");
            func_to_run.args = {item, price};
            break;
        case "sub" :
        case "subtract" :
            func_to_run.do = subtractAction;
            [,item, price] = input_text.split(" ");
            func_to_run.args = {item, price};
            break;
        default:
    }
    return func_to_run;
}