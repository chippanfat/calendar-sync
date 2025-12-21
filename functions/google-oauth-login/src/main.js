import { Client, Users, Databases } from 'node-appwrite';

// Function to handle Google OAuth token storage for calendar integration
export default async ({ req, res, log, error }) => {
  // 1. Check if user is authenticated
  const userId = req.headers['x-appwrite-user-id'];
  const sessionId = req.headers['x-appwrite-session-id'];
  
  if (!userId) {
    log('Unauthorized request - no user ID in headers');
    return res.json({
      success: false,
      message: 'Unauthorized. Please log in to connect your calendar.'
    }, 401);
  }

  log(`Request from authenticated user: ${userId}, session: ${sessionId}`);

  // 2. Initialize Appwrite SDK with API key (for server-side operations)
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);

  try {
    // 3. Parse request body (from frontend OAuth callback)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const { provider, accessToken, scope, expiresIn } = body;

    if (!provider || !accessToken) {
      return res.json({
        success: false,
        message: 'Missing required fields: provider and accessToken'
      }, 400);
    }

    log(`Storing ${provider} calendar token for user ${userId}`);

    // 4. Store the OAuth token securely in your database
    // TODO: In production, encrypt the access token before storing!
    const calendarData = {
      userId: userId,
      provider: provider,
      accessToken: accessToken,  // IMPORTANT: Encrypt this in production!
      scope: scope,
      expiresAt: Date.now() + (parseInt(expiresIn) * 1000),
      connectedAt: new Date().toISOString(),
    };

    // Store in your user_calendars collection
    await databases.createDocument(
      process.env.DATABASE_ID || '6939e81e00122e88459e',  // Your calendar-db ID
      'user_calendars',
      'unique()',
      calendarData,
      [`read("user:${userId}")`, `write("user:${userId}")`, `delete("user:${userId}")`]  // User-specific permissions
    );

    log(`Successfully stored ${provider} calendar token for user ${userId}`);

    return res.json({
      success: true,
      message: `${provider} calendar connected successfully`,
      provider: provider,
      connectedAt: calendarData.connectedAt
    });

  } catch (err) {
    error(`Error storing calendar token: ${err.message}`);
    
    return res.json({
      success: false,
      message: 'Failed to connect calendar. Please try again.',
      error: err.message
    }, 500);
  }
};
