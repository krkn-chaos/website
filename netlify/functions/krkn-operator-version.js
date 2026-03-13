const axios = require('axios');

exports.handler = async function() {
  try {
    // Try to get redirect without following it
    const response = await axios.head('https://github.com/krkn-chaos/krkn-operator/releases/latest', {
      maxRedirects: 0,
      validateStatus: (status) => status === 302 || status === 301 // Accept redirect responses
    });

    const location = response.headers.location;

    if (location) {
      // Extract everything after /tag/
      const match = location.match(/\/tag\/(.+)$/);
      if (match) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ version: match[1] })
        };
      }
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Version not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
