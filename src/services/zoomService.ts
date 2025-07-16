import axios from 'axios';

export class ZoomService {
  private accessToken?: string;
  private email?: string;
  private password?: string;

  constructor(accessToken?: string, email?: string, password?: string) {
    this.accessToken = accessToken;
    this.email = email;
    this.password = password;
  }

  async authenticate() {
    if (!this.email || !this.password) {
      throw new Error('Email e senha do Zoom são necessários');
    }

    try {
      const response = await axios.post(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          grant_type: 'password',
          username: this.email!,
          password: this.password!,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          },
        }
      );
      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      console.error('Erro na autenticação do Zoom:', error);
      throw error;
    }
  }

  async createMeeting(meetingData: {
    topic: string;
    start_time: string;
    duration: number;
    agenda?: string;
  }) {
    try {
      // Authenticate if no access token
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: meetingData.topic,
          type: 2, // Scheduled meeting
          start_time: meetingData.start_time,
          duration: meetingData.duration,
          agenda: meetingData.agenda,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 0,
            audio: 'both',
            auto_recording: 'none',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  }
} 