
export class ZoomService {
  private accessToken?: string
  private email?: string
  private password?: string

  constructor(accessToken?: string, email?: string, password?: string) {
    this.accessToken = accessToken
    this.email = email
    this.password = password
  }

  async authenticate() {
    if (!this.email || !this.password) {
      throw new Error('Email e senha do Zoom são necessários')
    }

    try {
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.email,
          password: this.password,
        })
      })

      if (!response.ok) {
        throw new Error('Falha na autenticação do Zoom')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      return data
    } catch (error) {
      console.error('Erro na autenticação do Zoom:', error)
      throw error
    }
  }

  async createMeeting(meetingData: {
    topic: string
    start_time: string
    duration: number
    agenda?: string
  }) {
    try {
      // Authenticate if no access token
      if (!this.accessToken) {
        await this.authenticate()
      }

      const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      })

      if (!response.ok) {
        throw new Error(`Zoom API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating Zoom meeting:', error)
      throw error
    }
  }
}
