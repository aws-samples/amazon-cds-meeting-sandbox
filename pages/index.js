import { useState, useEffect } from 'react';

import {
  useMeetingManager,
  useMeetingEvent,
  useAudioVideo,
  useLocalVideo,
  ControlBar,
  ControlBarButton,
  Remove,
  Meeting,
  LeaveMeeting,
  AudioInputControl,
  DeviceLabels,
  VideoInputControl,
  AudioOutputControl,
  MeetingStatus,
  RemoteVideos,
  Input,
  useMeetingStatus,
  LocalVideo,
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import {
  SpaceBetween,
  Box,
  ContentLayout,
  Container,
  Header,
} from '@cloudscape-design/components';

export default function MeetingComponent() {
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const meetingEvent = useMeetingEvent();
  const audioVideo = useAudioVideo();
  const [meetingId, setMeetingId] = useState('');
  const [requestId, setRequestId] = useState('');
  const { toggleVideo } = useLocalVideo();

  useEffect(() => {
    if (meetingEvent) {
      if (meetingEvent.name === 'meetingStartSucceeded') {
        setMeetingId(meetingEvent.attributes.meetingId);
        setTimeout(() => {
          handleEnd();
        }, 60000);
      }
    }
  }, [meetingEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  const JoinButtonProps = {
    icon: <Meeting />,
    onClick: (event) => handleJoin(event),
    label: 'Join',
  };

  const LeaveButtonProps = {
    icon: <LeaveMeeting />,
    onClick: (event) => handleLeave(event),
    label: 'Leave',
  };

  const EndButtonProps = {
    icon: <Remove />,
    onClick: (event) => handleEnd(event),
    label: 'End',
  };

  useEffect(() => {
    async function tog() {
      if (meetingStatus === MeetingStatus.Succeeded) {
        await toggleVideo();
      }
    }
    tog();
  }, [meetingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeave = async () => {
    await meetingManager.leave();
  };

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

  const handleEnd = async (event) => {
    const endpoint = '/api/end';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetingId: meetingId }),
    };
    await fetch(endpoint, options);
    setMeetingId('');
  };

  return (
    <ContentLayout
      header={
        <SpaceBetween size='m'>
          <Header>Amazon Chime SDK Meeting</Header>
        </SpaceBetween>
      }
    >
      <Container>
        <SpaceBetween direction='vertical' size='l'>
          <div className='RemoteVideos'>
            <RemoteVideos />
            <div>{audioVideo && <LocalVideo className='LocalVideo' />}</div>
          </div>

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
    </ContentLayout>
  );
}
