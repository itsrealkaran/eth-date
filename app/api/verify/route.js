import { NextResponse } from "next/server";
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";

export async function POST(request) {
  try {
    const { payload, action, signal } = await request.json();

    // Get app_id from environment variables
    const app_id = process.env.APP_ID || "app_demo_123";

    // Verify the proof using World ID's verification service
    const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

    if (verifyRes.success) {
      // This is where you should perform backend actions if the verification succeeds
      // Such as, setting a user as "verified" in a database
      console.log("Verification successful:", verifyRes);
      return NextResponse.json({
        verifyRes,
        status: 200,
        message: "Verification successful",
      });
    } else {
      // This is where you should handle errors from the World ID /verify endpoint
      // Usually these errors are due to a user having already verified
      console.log("Verification failed:", verifyRes);
      return NextResponse.json({
        verifyRes,
        status: 400,
        message: "Verification failed",
      });
    }
  } catch (error) {
    console.error("Verification API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
