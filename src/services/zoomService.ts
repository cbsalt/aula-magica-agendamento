import axios from "axios";

export function getZoomOAuthUrl(): string {
  const clientId = process.env.ZOOM_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "ZOOM_CLIENT_ID não está definido nas variáveis de ambiente"
    );
  }
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/zoom/connect`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  return `https://zoom.us/oauth/authorize?${params.toString()}`;
}

export const disconnectZoom = async () => {
  const res = await axios.post("/api/zoom/disconnect");
  return res.data;
};
