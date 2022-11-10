import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // below normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 }, // normal load
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 }, // around the breaking point
    { duration: '5m', target: 300},
    { duration: '2m', target: 400 }, // beyond the breaking point
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 }, // scale down. Recovery stage.
  ],
};

export default function () {
  const BASE_URL = 'http://localhost:3001/reviews'; // make sure this is not production

  const payload = JSON.stringify({
      product_id: 40344,
      rating: 4,
      date: "2022-11-08",
      summary: "set my hair on fire",
      body: "like I said, I was lit up like times square",
      recommend: true,
      reviewer_name: "Frank the Tank",
      reviewer_email: "franklin@app.com",
      photos: ["url.com", "mtdiablourl.com", "anotherphoto.url"],
      characteristics: {
          Fit: {id: 40344, value: 3}
      }
  })

  // const responses = http.get(`${BASE_URL}/40344?page=1&count=5&sort='relevant'`)
  // const responses = http.get(`${BASE_URL}/meta/40344`)
  const responses = http.post(`${BASE_URL}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  // const responses = http.put(`${BASE_URL}/40344/helpful`)
  // const responses = http.put(`${BASE_URL}/40344/report`)

  // const responses = http.batch([
  //   ['GET', `${BASE_URL}/40344?page=1&count=5&sort='relevant'`],
  //   ['GET', `${BASE_URL}/meta/40344`],
  //   ['POST', `${BASE_URL}`, payload],
  //   ['PUT', `${BASE_URL}/40344/helpful`],
  //   ['PUT', `${BASE_URL}/40344/report`]
  // ]);

  sleep(1);
}
