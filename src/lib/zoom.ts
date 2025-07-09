
export class ZoomService {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async createMeeting(meetingData: {
    topic: string
    start_time: string
    duration: number
    agenda?: string
  }) {
    try {
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
