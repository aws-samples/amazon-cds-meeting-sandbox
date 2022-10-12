# Amazon CDS Meetings Sandbox

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/aws-samples/amazon-cds-meeting-sandbox)

[Additional instructions](#deploy-to-amplify) for deploying to AWS Amplify.

## Included Demo

This repository includes a simple Amazon Chime SDK Meetings demo that uses the [NextJS](https://nextjs.org/learn/foundations/about-nextjs/what-is-nextjs) framework. With this framework, we are able to use [CodeSandbox](https://codesandbox.io/docs/overview) and [AWS Amplify](https://aws.amazon.com/amplify/) to quickly develop and then deploy a [server side rendered](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html) (SSR) application.

### Amazon Chime SDK Meeting Basics

Amazon Chime SDK Meetings are generally composed of a front end client and back end used to create the meeting and attendee. In this demo, we will be combining them in a single NextJS application.

#### Backend APIs

There are two APIs in this application:

- join.js
- end.js

These APIs will perform the tasks of creating the meeting and attendee and the task of deleting the meeting.

```javascript
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
```

This function in `join.js` will use the [AWS SDK for Javascript](https://aws.amazon.com/sdk-for-javascript/) to send the [`CreateMeetingCommand`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-chime-sdk-meetings/index.html). With the meetingId returned from this request, we will create an attendee for this meeting and return both results to the front end client.

#### Front End Client

There are two many components required to join an Amazon Chime SDK meeting used in the front end client:

- Request to back end for meeting information
- Rendering of video tiles

The request to the back end for meeting information is found in the handleJoin function:

```javascript
const handleJoin = async (event) => {
  const endpoint = '/api/join';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requestId: requestId }),
  };
  const response = await fetch(endpoint, options);
  const result = await response.json();

  const meetingSessionConfiguration = new MeetingSessionConfiguration(
    result.data.Meeting,
    result.data.Attendee,
  );

  const meetingOptions = {
    deviceLabels: DeviceLabels.AudioAndVideo,
  };

  await meetingManager.join(meetingSessionConfiguration, meetingOptions);
  await meetingManager.start();

  setMeetingId(result.data.Meeting.MeetingId);
};
```

In this function, the request is made to the back end API. Once the response has been returned, that information is used to `join` and `start` the meeting.

Using React components, the local and remote video tiles are displayed.

```javascript
<Container>
  <SpaceBetween direction='vertical' size='l'>
    <div className='RemoteVideos'>
      <RemoteVideos />
    </div>
    {audioVideo && (
      <div className='LocalVideo'>
        <LocalVideo />
      </div>
    )}
    <Box>
      <ControlBar
        showLabels={true}
        responsive={true}
        layout='undocked-horizontal'
      >
        <Input
          showClear={true}
          onChange={(e) => setRequestId(e.target.value)}
          sizing={'md'}
          value={requestId}
          placeholder='Request ID'
          type='text'
          style={{ marginLeft: '20px', marginRight: '20px' }}
        />

        <ControlBarButton {...JoinButtonProps} />
        <ControlBarButton {...LeaveButtonProps} />
        <ControlBarButton {...EndButtonProps} />
        <AudioInputControl />
        <AudioOutputControl />
        <VideoInputControl />
      </ControlBar>
    </Box>
  </SpaceBetween>
</Container>
```

This JSX uses the `<RemoteVideos />` and `<LocalVideo />` components to render the video along with several buttons to control the meeting and local media devices (microphone, speaker, and camera).

## AWS Credentials

Because this demo uses `CreateMeeting`, `CreateAttendee`, and `DeleteMeeting` AWS SDK requests, credentials must be provided. In this demo, we will use a [User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with a [Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) with AWS Identity and Access Management (IAM) appropriate permissions. When used in CodeSandbox and AWS Amplify, these credentials will need to be included as environment variables `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` to be used by the APIs:

```javascript
const config = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
};
```

## Deploy to Amplify

After clicking the above button to deploy to AWS Amplify, we will need to complete a few more steps. The process will begin by forking this repository. To complete this, you will need to the GitHub Apps feature to [authorize Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html) to use your GitHub repository.

### Add Environment Variables

In addition to the `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` environment variables, you should also include `AMPLIFY_NEXTJS_EXPERIMENTAL_TRACE` = `true`. These should be entered as part of the deploy process.

### Adding a Service Role

Because we are deploying an SSR application, AWS Amplify requires a Service Role with [appropriate permissions](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html#ssr-IAM-permissions). These can be [configured](https://docs.aws.amazon.com/amplify/latest/userguide/how-to-service-role-amplify-console.html) through the IAM Console.

### Update Build Settings

In the App settings, select Build settings and Edit. Set the Next.js version to `latest` and the Node.js version to `14`. This will ensure the AWS Lambdas that are created as part of this application use Node version 14.

### Redeploy

Once these have been completed, return to your App and select `Redeploy this version`.

## Test Locally

Additionally, NextJS can be used locally to develop and test locally. After cloning this repository, add AWS credentials as environment variables in a `.env.local` file. You can then run a development server via `yarn dev`.
