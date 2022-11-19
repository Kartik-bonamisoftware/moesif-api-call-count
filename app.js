const http = require("http");
const https = require("https");

const API_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHAiOiI5Nzk6MTM3Iiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDQ1NDA0MzM1Mzg5NzgyMjU0NDgiLCJhdWQiOiI2dVowbk9qZnJyOE5JajRyOEk2Tk51clN2RjdWWTJtTCIsInZlciI6IjEiLCJvcmciOiIxMDQ3OjkzIiwicGVybWlzc2lvbnMiOnsiMTA0Nzo5MyI6eyJzY3AiOiJjcmVhdGU6YWNjZXNzX3Rva2VucyBjcmVhdGU6ZW5jcnlwdGVkX2tleXMgZGVsZXRlOmVuY3J5cHRlZF9rZXlzIHJlYWQ6ZW5jcnlwdGVkX2tleXMgdXBkYXRlOmVuY3J5cHRlZF9rZXlzIGNyZWF0ZTpldGhfYWJpIGNyZWF0ZTphcHBzIGRlbGV0ZTphcHBzIHJlYWQ6YXBwcyB1cGRhdGU6YXBwcyB1cGRhdGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6Y29ob3J0cyBkZWxldGU6Y29ob3J0cyByZWFkOmNvaG9ydHMgdXBkYXRlOmNvaG9ydHMgY3JlYXRlOnZpcnR1YWxfZXZlbnR0eXBlcyBkZWxldGU6dmlydHVhbF9ldmVudHR5cGVzIHJlYWQ6dmlydHVhbF9ldmVudHR5cGVzIHVwZGF0ZTp2aXJ0dWFsX2V2ZW50dHlwZXMgY3JlYXRlOmNvbXBhbmllcyBkZWxldGU6Y29tcGFuaWVzIHJlYWQ6Y29tcGFuaWVzIHVwZGF0ZTpjb21wYW5pZXMgY3JlYXRlOmV2ZW50cyByZWFkOmV2ZW50cyBjcmVhdGU6cmVwb3J0cyBkZWxldGU6cmVwb3J0cyByZWFkOnJlcG9ydHMgY3JlYXRlOnVzZXJzIGRlbGV0ZTp1c2VycyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBjcmVhdGU6ZGFzaGJvYXJkcyBkZWxldGU6ZGFzaGJvYXJkcyByZWFkOmRhc2hib2FyZHMgdXBkYXRlOmRhc2hib2FyZHMgcmVhZDpwdWJsaWNfd29ya3NwYWNlcyBjcmVhdGU6d29ya3NwYWNlcyBkZWxldGU6d29ya3NwYWNlcyByZWFkOndvcmtzcGFjZXMgdXBkYXRlOndvcmtzcGFjZXMifX0sImlzcyI6Imh0dHBzOi8vd3d3Lm1vZXNpZi5jb20vd3JhcC9hcHAvMTA0Nzo5My05Nzk6MTM3IiwiaWF0IjoxNjY1OTY0ODAwLCJqdGkiOiJlNTViZGM0Mi1jNGI5LTQ1N2MtODA3ZC1lMjQ0NWYyY2M2N2QifQ.oK9QDCyVP6XktDc0Bmr1QK-3s5Sk8GEeGniZ7YFRKuw";
const USER_ID =
  "eyJhcHAiOiI5Nzk6MTM3IiwidmVyIjoiMi4wIiwib3JnIjoiMTA0Nzo5MyIsImlhdCI6MTY2NDU4MjQwMH0.vzZPW6Mu4VjAVJRnDInenoUlShtGFxOTtHifpVVAuOU";

const quotaOneMillionCalls = 1000000;

const handleRequest = (request, response) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  const query = JSON.stringify({
    post_filter: {
      bool: {
        should: {
          term: { "user_id.raw": USER_ID },
        },
      },
    },
  });

  https
    .request(
      "https://api.moesif.com/search/~/count/events?from=-720h&to=now",
      requestOptions,
      (moesifResponse) => {
        let data = "";
        moesifResponse
          .on("data", (chunk) => (data += chunk))
          .on("end", () => {
            const apiCalls = JSON.parse(data).hits.total;
            const usage = apiCalls / (quotaOneMillionCalls / 100);
            response.end(
              `User ${USER_ID} made ${apiCalls} API calls. That is ${usage}% of their quota.`
            );
          });
      }
    )
    .end(query);
};

http.createServer(handleRequest).listen(8888);
