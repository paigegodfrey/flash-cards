const db = require("../db");

class Card {

  /** Find all flash cards (can filter on terms in question). */

  static async findAll(data) {
    let baseQuery = `SELECT id, username, category, question, answer FROM cards`;
    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (data.category) {
      queryValues.push(data.category);
      whereExpressions.push(`category = $${queryValues.length}`);
    }

    if (data.search) {
      queryValues.push(`%${data.search}%`);
      whereExpressions.push(`question ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      baseQuery += " WHERE ";
    }

    // Finalize query and return results

    let finalQuery = baseQuery + whereExpressions.join(" AND ") + " ORDER BY question";
    const cardsRes = await db.query(finalQuery, queryValues);
    return cardsRes.rows;
  }

  /** Given a card id, return data about card. */

  static async findOne(id) {
    const cardRes = await db.query(
      `SELECT id, username, category, question, answer
              FROM cards
              WHERE id = $1`,
      [id]);

    const card = cardRes.rows[0];

    if (!card) {
      const error = new Error(`There exists no flash-card '${id}'`);
      error.status = 404;   // 404 NOT FOUND
      throw error;
    }

    return card;
  }

  /** Create a flash card (from data), update db, return new card data. */

  static async create(data) {
    const result = await db.query(
      `INSERT INTO cards 
            (username, category, question, answer)
          VALUES ($1, $2, $3, $4) 
          RETURNING id, username, category, question, answer`,
      [data.username, data.category, data.question, data.answer]);

    return result.rows[0];
  }

  /** Update flash card and return data. */

  static async update(id, data) {
    const result = await db.query(
      `UPDATE cards SET category=$1, question=$2, answer=$3
          WHERE id=$4
          RETURNING id, username, category, question, answer`,
      [data.category, data.question, data.answer, data.id]);

    return result.rows[0];
  }

  /** Delete given card from database; returns undefined. */

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM cards 
            WHERE id = $1 
            RETURNING id`,
      [id]);

    if (result.rows.length === 0) {
      let notFound = new Error(`There exists no card '${id}`);
      notFound.status = 404;
      throw notFound;
    }
  }
}