// Dummy WorldID account detection API
// Replace this with actual WorldID integration

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For now, always return that account doesn't exist
    // This will trigger the NFC flow
    const response = {
      exists: false,
      userId: null,
      message: "Account not found - please scan NFC to create account",
    };

    return Response.json(response);

    // Uncomment below when you have actual WorldID integration:
    /*
    const worldIdResponse = await fetch('YOUR_WORLDID_API_ENDPOINT', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WORLDID_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (worldIdResponse.ok) {
      const worldIdData = await worldIdResponse.json()
      return Response.json({
        exists: true,
        userId: worldIdData.userId,
        verified: worldIdData.verified,
        message: "Account found"
      })
    } else {
      return Response.json({
        exists: false,
        userId: null,
        message: "Account not found"
      })
    }
    */
  } catch (error) {
    console.error("WorldID check error:", error);
    return Response.json(
      {
        exists: false,
        error: error.message,
        message: "Failed to check account status",
      },
      { status: 500 }
    );
  }
}
