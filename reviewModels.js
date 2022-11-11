const pool = require('./pgPool.js');

module.exports = {
  getReviews: async function(id, page = 1, count = 5, sort = 'relevant') {
    let product_id = id;

    let offset = (page * count) - count;
    let orderby = '';
    switch(sort) {
      case 'helpful':
        orderby = 'helpfulness desc'
        break;
      case 'newest':
        orderby = 'date desc'
        break;
      case 'relevant':
        orderby = 'date desc, helpfulness desc'
        break;
      default:
        orderby = 'date desc, helpfulness desc'
        break;
    }

    const queryString = `SELECT * FROM reviews WHERE product_id = ${product_id} ORDER BY ${orderby} LIMIT ${count} OFFSET ${offset}`
    let reviews = pool.query(queryString);
    return reviews;
  },
  getMeta: (product_id) => {
    const queryString =
    `SELECT json_build_object(
        'product_id', ${product_id},
        'ratings', (SELECT json_build_object(
            '1', (SELECT COUNT(rating)
                FROM reviews
                WHERE product_id=${product_id} AND rating=1),
            '2', (SELECT COUNT(rating)
                FROM reviews
                WHERE product_id=${product_id} AND rating=2),
            '3', (SELECT COUNT(rating)
                FROM reviews
                WHERE product_id=${product_id} AND rating=3),
            '4', (SELECT COUNT(rating)
                FROM reviews
                WHERE product_id=${product_id} AND rating=4),
            '5', (SELECT COUNT(rating)
                FROM reviews
                WHERE product_id=${product_id} AND rating=5)
            )
            FROM reviews
            WHERE product_id=${product_id}
            LIMIT 1),
        'recommended', (SELECT json_build_object(
            'false', (SELECT COUNT(recommend)
              FROM reviews
              WHERE product_id=${product_id} AND recommend='false'),
            'true', (SELECT COUNT(recommend)
              FROM reviews
              WHERE product_id=${product_id} AND recommend='true')
            )
            FROM reviews
            WHERE product_id=${product_id}
            LIMIT 1),
        'characteristics', (SELECT json_object_agg(
          name, (SELECT json_build_object(
            'id', product_characteristics.id,
            'value', (SELECT AVG(value)
              FROM reviews_characteristics
              WHERE characteristic_id=product_characteristics.id
              )
            )
            FROM reviews_characteristics
            LIMIT 1)
        )
        FROM product_characteristics
        WHERE product_id=${product_id}
        )) AS meta;`
    let meta = pool.query(queryString);
    return meta;
  },


  // (
  //   SELECT product_id from product_characteristics,
  //   SELECT name from product_characteristics,
  //   json_build_object(
  //     'id', id from product_characteristics,
  //     'value', value from reviews_characteristics
  //   )
  //   FROM characteristic_reviews
  //   INNER JOIN
  //     product_characteristics
  //   ON
  //     product_characteristics(id) = reviews_characteristics(characteristic_id)
  //   WHERE
  //     product_id = ${product_id}
  // );


  addReview: async({product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, photos, characteristics}) => {
    const params = [product_id, rating, summary, body, recommend, reviewer_name, reviewer_email];
    const queryString = `INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
                        VALUES($1,$2,now(),$3,$4,$5,false,$6,$7,null,0)
                        RETURNING id AS review_id`;
    let reviewAdded = await pool.query(queryString, params);
    const review_id = reviewAdded.rows[0].review_id;
    const photoQueryString = `INSERT INTO photos(review_id, url) VALUES($1, unnest($2::text[]));`
    let photosAdded = await pool.query(photoQueryString, [review_id, photos]);
    let char_id = [];
    let charReviewsContainer = [];
    for (let key in characteristics) {
        char_id.push(characteristics[key].id);
        charReviewsContainer.push(characteristics[key].value);
    }
    const charQueryString = `INSERT INTO reviews_characteristics(characteristic_id, review_id, value) VALUES (unnest($1::integer[]), $2, unnest($3::integer[]))`

    let add = pool.query(charQueryString, [char_id, review_id, charReviewsContainer]);
    return add;
  },
  markHelpful: function(r_id) {
    let review_id = r_id;
    const queryString = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${review_id}`;
    let helpful = pool.query(queryString);
    return helpful;
  },

  reportReview: function(r_id) {
    let review_id = r_id;
    const queryString = `UPDATE reviews SET reported = false WHERE id = ${review_id}`;
    let reported = pool.query(queryString);
    return reported;
  },
}