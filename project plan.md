API's to create
********************
1. Api to create a user ✅
2. Fetch all channels belonging to a workspace ✅
3. Create a channel ✅
3. Fetch all workspace belonging to a user ✅
4. Fetch all users belonging to a workspace ✅
5. Api to fetch all messages belonging to a particular "DirectChat" ✅
6. Api to fetch all messages belonging to a particular "Channel"
7. Fetch a particular "DirectChat" using user_id and friend_id ✅

To search for a particular directChat take sender and reciever id and filter the directChat and find the one that contains both ✅











import React, { useEffect, useState } from 'react';
import axios from 'axios'; // or any other library for making HTTP requests

const ChannelComponent = ({ userId }) => {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    // Fetch channels data from the backend (replace 'your-api-endpoint' with the actual URL)
    axios.get('your-api-endpoint')
      .then((response) => {
        setChannels(response.data);
      })
      .catch((error) => {
        console.error('Error fetching channels data:', error);
      });
  }, []);

  if (channels.length === 0) {
    return <div>Loading...</div>;
  }

  const canAccessChannel = (channel) => {
    if (channel.access_type === 'public') {
      return true;
    } else if (channel.access_type === 'private' && channel.members.includes(userId)) {
      return true;
    } else if (channel.access_type === 'restricted' && channel.allowed_members.includes(userId)) {
      return true;
    }
    return false;
  };

  return (
    <div>
      {channels.map((channel) => {
        if (canAccessChannel(channel)) {
          return (
            <div key={channel._id}>
              <h2>{channel.name}</h2>
              {/* Render other channel details here */}
            </div>
          );
        } else {
          return (
            <div key={channel._id}>
              <h2>{channel.name}</h2>
              <p>You don't have access to this channel.</p>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ChannelComponent;
