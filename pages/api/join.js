import { randomUUID } from 'crypto';

import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
} from '@aws-sdk/client-chime-sdk-meetings';

const config = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
};

console.log(config);

const chimeSdkMeetingsClient = new ChimeSDKMeetingsClient(config);

export default async function handler(req, res) {
  const requestId = req.body.requestId;
  console.info(`RequestID: ${requestId}`);
  const meetingInfo = await createMeeting(requestId || randomUUID());
  console.info(`MeetingInfo: ${meetingInfo}`);
  if (meetingInfo) {
    const attendeeInfo = await createAttendee(meetingInfo.Meeting.MeetingId);
    if (attendeeInfo) {
      console.info(`AttendeeInfo: ${attendeeInfo}`);
      const responseInfo = {
        Meeting: meetingInfo.Meeting,
        Attendee: attendeeInfo.Attendee,
      };

      console.info('joinInfo: ' + JSON.stringify(responseInfo));
      res.status(200).json({ data: responseInfo });
    } else {
      res.status(503).json({ data: 'Error creating attendee' });
    }
  } else {
    res.status(503).json({ data: 'Error creating meeting' });
  }
}

async function createMeeting(requestId) {
  console.log(`Creating Meeting for Request ID: ${requestId}`);

  try {
    const meetingInfo = await chimeSdkMeetingsClient.send(
      new CreateMeetingCommand({
        ClientRequestToken: requestId,
        MediaRegion: 'us-east-1',
        ExternalMeetingId: randomUUID(),
      }),
    );
    return meetingInfo;
  } catch (err) {
    console.info(`Error: ${err}`);
    return false;
  }
}

async function createAttendee(meetingId) {
  console.log(`Creating Attendee for Meeting: ${meetingId}`);
  try {
    const attendeeInfo = await chimeSdkMeetingsClient.send(
      new CreateAttendeeCommand({
        MeetingId: meetingId,
        ExternalUserId: randomUUID(),
      }),
    );
    return attendeeInfo;
  } catch (err) {
    console.info(`${err}`);
    return false;
  }
}
