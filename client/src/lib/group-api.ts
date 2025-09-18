import axios from "axios";
import { Group, GroupData } from "../type";

const API_URL = import.meta.env.VITE_API_URL as string;

export async function fetchGroups(): Promise<{
  createdGroups: Group[];
  memberGroups: Group[];
}> {
  const [createdRes, memberRes] = await Promise.all([
    axios.get(`${API_URL}/api/groups/created`, { withCredentials: true }),
    axios.get(`${API_URL}/api/groups/joined`, { withCredentials: true }),
  ]);

  return {
    createdGroups: createdRes.data.groups,
    memberGroups: memberRes.data.groups,
  };
}

export async function getjoinRequest(): Promise<any> {
  try {
    const response = await axios.get(`${API_URL}/api/groups/join-request`, {
      withCredentials: true,
    });

    // format the data
    const data = response.data;
    // console.log("data: ", data);

    const joinRequests = data.requests.map((request: any) => ({
      id: request.id,
      name: request.user.name,
      avatar: request.user.avatarUrl,
      groupId: request.groupId,
      email: request.user.email,
    }));

    console.log("joinRequests: ", joinRequests);

    return joinRequests;
  } catch (error) {
    console.error("Error joining group:", error);
    return error;
  }
}

export async function createGroup(
  name: string,
  subject: string,
  description?: string
): Promise<Group> {
  const response = await axios.post(
    `${API_URL}/api/groups/create`,
    { name, subject, description },
    { withCredentials: true }
  );
  return response.data;
}

export async function joinGroup(groupCode: string): Promise<void> {
  console.log("Joining group with code:", groupCode);

  await axios.post(
    `${API_URL}/api/groups/join`,
    { groupCode },
    { withCredentials: true }
  );
}

// acceptRequest and rejectRequest functions
export async function acceptRequest(requestId: string): Promise<Boolean> {
  try {
    await axios.post(
      `${API_URL}/api/groups/accept-join-request`,
      { requestId },
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    console.error("Error accepting request:", error);
    return false;
  }
}

export async function rejectRequest(requestId: string): Promise<Boolean> {
  try {
    await axios.post(
      `${API_URL}/api/groups/reject-join-request`,
      { requestId },
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    console.error("Error rejecting request:", error);
    return false;
  }
}

export async function getGroupdetails(groupId: string): Promise<GroupData> {
  try {
    const response = await axios.post(
      `${API_URL}/api/groups/group-details`,
      { groupId },
      { withCredentials: true }
    );
    return response.data.group;
  } catch (error) {
    console.error("Error getting group details:", error);
    throw error;
  }
}

// leaveGroup function
export async function leaveGroup(groupId: string): Promise<Boolean> {
  try {
    await axios.post(
      `${API_URL}/api/groups/leave-group`,
      { groupId },
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
    return false;
  }
}

// deleteGroup function
export async function deleteGroup(groupId: string): Promise<Boolean> {
  try {
    await axios.post(
      `${API_URL}/api/groups/delete-group`,
      { groupId },
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
    return false;
  }
}

// get group message and Files
export async function getGroupItems(groupId: string): Promise<any> {
  try {
    const [messagesResponse, filesResponse] = await Promise.all([
      axios.get(`${API_URL}/api/groups/${groupId}/messages`, {
        withCredentials: true,
      }),
      axios.get(`${API_URL}/api/groups/${groupId}/files`, {
        withCredentials: true,
      }),
    ]);

    const messages = messagesResponse.data.messages;
    const files = filesResponse.data.files;

    // Merge and sort by createdAt
    const allItems = [...messages, ...files].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return allItems;
  } catch (error) {
    console.error("Error getting group messages and files:", error);
    throw error;
  }
}
