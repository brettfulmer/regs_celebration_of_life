function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'GET,POST,OPTIONS'
  };
}

function handleOptions(event) {
  if (event.httpMethod !== 'OPTIONS') return null;
  return {
    statusCode: 204,
    headers: {
      ...corsHeaders()
    },
    body: ''
  };
}

module.exports = {
  json,
  corsHeaders,
  handleOptions
};
